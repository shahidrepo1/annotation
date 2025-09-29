from graphviz import Digraph

dfd = Digraph("AI_Training_System")

# Define main entities
dfd.node("User", shape="ellipse")
dfd.node("Speaker Folder", shape="folder")
dfd.node("AI Training Module", shape="parallelogram")
dfd.node("TrainingVersions DB", shape="cylinder")
dfd.node("AudioFiles DB", shape="cylinder")

# Define versions tracking
dfd.node("Trained Data", shape="box", style="filled", fillcolor="lightblue")
dfd.node("Untrained Data", shape="box", style="filled", fillcolor="lightgray")
dfd.node("Version 1.0", shape="record", label="{Version 1.0 | Trained: ✓ | Untrained: ✗}")
dfd.node("Version 2.0", shape="record", label="{Version 2.0 | Trained: ✓ | Untrained: ✓}")

# Data flow
dfd.edge("User", "Speaker Folder", label="Upload Audio Files")
dfd.edge("User", "AI Training Module", label="Select Folders & Start Training")
dfd.edge("Speaker Folder", "AI Training Module", label="Provide Audio Data")

# Training process
dfd.edge("AI Training Module", "Trained Data", label="Processed & Used for AI")
dfd.edge("AI Training Module", "Untrained Data", label="Not Yet Used for Training")

# Versions & data storage
dfd.edge("Trained Data", "Version 1.0", label="Used Data")
dfd.edge("Untrained Data", "Version 2.0", label="Pending Training")
dfd.edge("Version 1.0", "TrainingVersions DB", label="Store Training History")
dfd.edge("AI Training Module", "AudioFiles DB", label="Log Audio Usage")

# User gets training progress
dfd.edge("TrainingVersions DB", "User", label="Retrieve Training Progress")

# Render the DFD
dfd.render("dfd_ai_training_system", format="png", view=True)
