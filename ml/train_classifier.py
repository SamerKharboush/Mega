#!/usr/bin/env python3
"""Train a cancer subtype classifier."""

import argparse
import sys
from pathlib import Path

import torch
from torch.utils.data import Dataset, DataLoader
import torch.nn as nn
import torch.nn.functional as F
import json
from tqdm import tqdm


class SlideDataset(Dataset):
    """Dataset for slide-level classification."""

    def __init__(self, features_dir, labels_file, split="train"):
        self.features_dir = Path(features_dir)
        with open(labels_file) as f:
            all_data = json.load(f)
        self.data = [d for d in all_data if d.get("split") == split]

        self.label_to_idx = {}
        for d in all_data:
            label = d["label"]
            if label not in self.label_to_idx:
                self.label_to_idx[label] = len(self.label_to_idx)

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        features = torch.load(self.features_dir / f"{item['slide_id']}.pt")
        label_idx = self.label_to_idx[item["label"]]
        return features, label_idx


class AttentionMIL(nn.Module):
    """Attention-based Multiple Instance Learning classifier."""

    def __init__(self, feature_dim=1024, hidden_dim=256, num_classes=9, dropout=0.25):
        super().__init__()
        self.proj = nn.Sequential(
            nn.Linear(feature_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
        )
        self.attention = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.Tanh(),
            nn.Linear(hidden_dim // 2, 1),
        )
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, num_classes),
        )

    def forward(self, x):
        h = self.proj(x)
        a = F.softmax(self.attention(h), dim=1)
        slide_repr = (h * a).sum(dim=1)
        return self.classifier(slide_repr)


def train(args):
    device = torch.device(args.device)
    train_data = SlideDataset(args.features_dir, args.labels_file, "train")
    val_data = SlideDataset(args.features_dir, args.labels_file, "val")

    num_classes = len(train_data.label_to_idx)
    model = AttentionMIL(num_classes=num_classes).to(device)

    train_loader = DataLoader(train_data, batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(val_data, batch_size=args.batch_size)

    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr)
    criterion = nn.CrossEntropyLoss()

    best_acc = 0
    for epoch in range(args.epochs):
        model.train()
        for features, labels in tqdm(train_loader, desc=f"Epoch {epoch+1}"):
            features, labels = features.to(device), labels.to(device)
            optimizer.zero_grad()
            logits = model(features)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()

        model.eval()
        correct, total = 0, 0
        with torch.no_grad():
            for features, labels in val_loader:
                features, labels = features.to(device), labels.to(device)
                preds = model(features).argmax(dim=1)
                correct += (preds == labels).sum().item()
                total += labels.size(0)

        acc = correct / total
        print(f"Epoch {epoch+1}: Val Acc = {acc:.4f}")

        if acc > best_acc:
            best_acc = acc
            Path(args.output_dir).mkdir(exist_ok=True)
            torch.save(model.state_dict(), Path(args.output_dir) / "best_model.pt")

    print(f"Training complete. Best accuracy: {best_acc:.4f}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--features-dir", required=True)
    parser.add_argument("--labels-file", required=True)
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--device", default="cuda")
    parser.add_argument("--output-dir", default="checkpoints")
    args = parser.parse_args()
    train(args)


if __name__ == "__main__":
    main()