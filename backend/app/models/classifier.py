import logging

import logging
logger = logging.getLogger(__name__)
"""
Classifier training module for fine-tuning on custom datasets.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
import numpy as np
from typing import List, Dict, Optional, Tuple
from pathlib import Path
import json
from tqdm import tqdm


class SlideDataset(Dataset):
    """Dataset for slide-level classification."""

    def __init__(
        self,
        features_dir: str,
        labels_file: str,
        split: str = "train",
    ):
        self.features_dir = Path(features_dir)
        self.split = split

        # Load labels
        with open(labels_file) as f:
            all_data = json.load(f)

        # Filter by split
        self.data = [d for d in all_data if d.get("split") == split]

        # Build label map
        self.label_to_idx = {}
        for d in all_data:
            label = d["label"]
            if label not in self.label_to_idx:
                self.label_to_idx[label] = len(self.label_to_idx)

        self.idx_to_label = {v: k for k, v in self.label_to_idx.items()}

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]

        # Load pre-computed features
        features_path = self.features_dir / f"{item['slide_id']}.pt"
        features = torch.load(features_path)

        label_idx = self.label_to_idx[item["label"]]

        return features, label_idx, item["slide_id"]


class AttentionMIL(nn.Module):
    """
    Attention-based Multiple Instance Learning classifier.
    """

    def __init__(
        self,
        feature_dim: int = 1024,
        hidden_dim: int = 256,
        num_classes: int = 9,
        dropout: float = 0.25,
    ):
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

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        h = self.proj(x)
        a = self.attention(h)
        a = F.softmax(a, dim=1)
        slide_repr = (h * a).sum(dim=1)
        logits = self.classifier(slide_repr)
        return logits, a.squeeze(-1)


class Trainer:
    """Trainer for pathology classifiers."""

    def __init__(
        self,
        model: nn.Module,
        train_loader: DataLoader,
        val_loader: DataLoader,
        device: str = "cuda",
        lr: float = 1e-4,
        weight_decay: float = 1e-4,
        epochs: int = 50,
    ):
        self.model = model.to(device)
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.device = device
        self.epochs = epochs

        self.optimizer = AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
        self.scheduler = CosineAnnealingLR(self.optimizer, T_max=epochs)
        self.criterion = nn.CrossEntropyLoss()
        self.best_val_acc = 0

    def train_epoch(self) -> Dict[str, float]:
        self.model.train()
        total_loss = 0
        correct = 0
        total = 0

        for features, labels, _ in tqdm(self.train_loader, desc="Training"):
            features = features.to(self.device)
            labels = labels.to(self.device)

            self.optimizer.zero_grad()
            logits, _ = self.model(features)
            loss = self.criterion(logits, labels)
            loss.backward()
            self.optimizer.step()

            total_loss += loss.item()
            _, predicted = logits.max(1)
            correct += predicted.eq(labels).sum().item()
            total += labels.size(0)

        self.scheduler.step()
        return {"loss": total_loss / len(self.train_loader), "accuracy": correct / total}

    @torch.no_grad()
    def validate(self) -> Dict[str, float]:
        self.model.eval()
        total_loss = 0
        correct = 0
        total = 0

        for features, labels, _ in self.val_loader:
            features = features.to(self.device)
            labels = labels.to(self.device)

            logits, _ = self.model(features)
            loss = self.criterion(logits, labels)

            total_loss += loss.item()
            _, predicted = logits.max(1)
            correct += predicted.eq(labels).sum().item()
            total += labels.size(0)

        return {"loss": total_loss / len(self.val_loader), "accuracy": correct / total}

    def train(self, save_dir: str = "checkpoints") -> float:
        Path(save_dir).mkdir(exist_ok=True)

        for epoch in range(self.epochs):
            train_metrics = self.train_epoch()
            val_metrics = self.validate()

            logger.info(f"Epoch {epoch + 1}/{self.epochs}")
            print(f"  Train Loss: {train_metrics['loss']:.4f}, Acc: {train_metrics['accuracy']:.4f}")
            print(f"  Val Loss: {val_metrics['loss']:.4f}, Acc: {val_metrics['accuracy']:.4f}")

            if val_metrics["accuracy"] > self.best_val_acc:
                self.best_val_acc = val_metrics["accuracy"]
                torch.save(self.model.state_dict(), Path(save_dir) / "best_model.pt")

        return self.best_val_acc