#!/usr/bin/env python3
"""Train a survival prediction model."""

import argparse
import torch
import torch.nn as nn
import numpy as np
from pathlib import Path
import json
from torch.utils.data import Dataset, DataLoader


class SurvivalDataset(Dataset):
    def __init__(self, features_dir, labels_file, split="train"):
        self.features_dir = Path(features_dir)
        with open(labels_file) as f:
            all_data = json.load(f)
        self.data = [d for d in all_data if d.get("split") == split]

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        features = torch.load(self.features_dir / f"{item['slide_id']}.pt")
        os_time = item.get("os_months", 0)
        os_event = item.get("os_event", 0)
        return features, torch.tensor([os_time, os_event], dtype=torch.float)


class CoxPHModel(nn.Module):
    """Cox Proportional Hazards model."""

    def __init__(self, feature_dim=1024, hidden_dim=256):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(feature_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.25),
            nn.Linear(hidden_dim, 1),
        )

    def forward(self, x):
        h = x.mean(dim=1)
        return self.encoder(h).squeeze(-1)


def cox_loss(risk, times, events):
    """Negative partial log-likelihood for Cox model."""
    idx = torch.argsort(times, descending=True)
    risk = risk[idx]
    events = events[idx]
    log_risk = risk - risk.max()
    log_sum_exp = torch.logcumsumexp(log_risk, dim=0)
    return -torch.mean((risk - log_sum_exp) * events)


def train(args):
    device = torch.device(args.device)

    train_data = SurvivalDataset(args.features_dir, args.labels_file, "train")
    train_loader = DataLoader(train_data, batch_size=args.batch_size, shuffle=True)

    model = CoxPHModel().to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr)

    for epoch in range(args.epochs):
        model.train()
        total_loss = 0
        for features, targets in train_loader:
            features = features.to(device)
            times = targets[:, 0].to(device)
            events = targets[:, 1].to(device)

            optimizer.zero_grad()
            risk = model(features)
            loss = cox_loss(risk, times, events)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        print(f"Epoch {epoch+1}: Loss = {total_loss/len(train_loader):.4f}")

    Path(args.output_dir).mkdir(exist_ok=True)
    torch.save(model.state_dict(), Path(args.output_dir) / "survival_model.pt")
    print("Model saved.")


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