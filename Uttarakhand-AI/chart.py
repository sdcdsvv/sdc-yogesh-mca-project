# Creating a compact Gantt-like chart optimized for embedding in a research paper.
# The chart uses matplotlib (single plot), small fonts, tight layout, and saves a high-DPI PNG.
# It shows time in minutes (converted from seconds) for a cleaner axis in paper figures.

import matplotlib.pyplot as plt
import numpy as np

# Data from user (seconds)
tasks = [
    ("Enhanced Multimodal - Training", 16200),
    ("Enhanced Multimodal - Inference", 0.78),
    ("Physiological Model - Training", 7920),
    ("Physiological Model - Inference", 0.32),
    ("Random Forest - Training", 1800),
    ("Random Forest - Inference", 0.08),
    ("Logistic Regression - Training", 360),
    ("Logistic Regression - Inference", 0.01),
]

# Convert seconds to minutes for cleaner axis
labels = [t[0] for t in tasks]
durations_min = [d/60.0 for _, d in tasks]  # minutes
starts_min = [0 for _ in tasks]

# Plot settings for a compact, paper-friendly figure
fig, ax = plt.subplots(figsize=(4.2, 3.0), dpi=300)  # small size, high DPI for papers
y_pos = np.arange(len(labels))

bar_height = 0.45  # compact bars
ax.barh(y_pos, durations_min, left=starts_min, height=bar_height)

# Annotate duration at the end of bars (show seconds for precision where <1s)
for i, (dur_min, dur_sec) in enumerate(zip(durations_min, [t[1] for t in tasks])):
    if dur_sec < 1:
        label = f"{dur_sec:.2f}s"
    else:
        label = f"{dur_min:.0f} min" if dur_min >= 1 else f"{dur_sec:.0f}s"
    ax.text(dur_min + 0.5, i, label, va='center', fontsize=6)

# Styling for paper: small fonts, minimal whitespace
ax.set_yticks(y_pos)
ax.set_yticklabels(labels, fontsize=7)
ax.invert_yaxis()  # tasks from top to bottom
ax.set_xlabel("Time (minutes)", fontsize=8)
ax.xaxis.set_tick_params(labelsize=7)
ax.set_xlim(0, max(durations_min) * 1.12 + 1)  # small right padding
ax.set_frame_on(False)
ax.tick_params(axis='y', left=False)  # hide y-axis ticks
ax.set_title("Computational Performance", fontsize=9, pad=6)

plt.tight_layout()

# Save the figure and display it
out_path = "gantt_compact.png"  # Save in current directory
plt.savefig(out_path, bbox_inches='tight', dpi=300)
plt.show()

print(f"Saved compact Gantt chart to: {out_path}")
