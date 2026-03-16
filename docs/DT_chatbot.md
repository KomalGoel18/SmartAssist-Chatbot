Button-Driven Decision-Tree Chatbot

This document outlines the end-to-end technical architecture for a non-conversational, state-driven chatbot designed for automated FAQs, lead generation, and functional integrations like appointment booking.

1. Core Architecture Pattern

The system follows a Finite State Machine (FSM) pattern. The conversation is treated as a series of defined "states." Each user interaction (button click) triggers a transition to a new state based on a predefined configuration.

System Components:

Frontend Client: A Next.js UI that renders the message thread and dynamic button inputs.

Knowledge Graph (The Logic): A JSON-based schema defining FAQ paths, informational content, and functional triggers.

Event Tracking Layer: Middleware that logs every "node entry" to capture user intent and drop-off points.

Persistence Layer: A backend service (API Route) that pipes structured data to a storage engine (Google Sheets or Database).

2. Conversation Logic Design (Directed Graph)

The chatbot does not use NLP (Natural Language Processing). Instead, it uses a structured Directed Graph where logic is decoupled from the UI code.

Informational Nodes (FAQs): These are the most common nodes. They contain a bot response and options that lead deeper into a topic or return to a previous menu (e.g., "Back to Main Menu").

Functional Nodes (Action Hooks): Specific nodes are flagged with metadata triggers. When a user reaches these, the system performs a task (e.g., trigger: "CREATE_BOOKING" or trigger: "SEND_BROCHURE").

Leaf Nodes: The "end" of a question path. These usually provide a definitive answer and offer buttons to restart or speak to a human (via external link).

3. Frontend Execution Flow

The frontend acts as an "interpreter" for the Knowledge Graph.

Initial Load: The client fetches the root node of the graph.

UI Rendering:

Bot messages are pushed to a visual "Display Array."

The input area is strictly mapped to the options array of the current node.

Text input is omitted entirely, forcing users to stay within the designed flow.

State Management:

User selects a button.

The client pushes the user's choice to the chat history for visual continuity.

The client updates the "Current State" and fetches/renders the next node in the graph.

UX Strategy: Implement smooth auto-scrolling and "typing" indicators (0.5s delay) to make the pre-defined flow feel more natural.

4. Behavior Tracking & Data Pipeline

Every click is a data point representing user interest or confusion.

Payload Construction: Every interaction sends:

Session ID: A UUID to track a single user's journey.

Node ID: The specific question or category accessed.

Choice Path: A breadcrumb string (e.g., "Home > Pricing > Enterprise Plan").

Timestamp: For calculating "Time on Node."

Data Ingestion: An API endpoint logs this to a "Behavioral Log" (Google Sheets).

Analysis Value: This allows you to see exactly which FAQs are the most popular and where users tend to "exit" without finding an answer.

5. Use Case: Appointment Booking & Lead Gen

While most nodes are for FAQs, certain paths collect data.

Linear Collection: For bookings, the graph moves through a linear path (Date -> Time -> Service).

Session Variable Storage: As the user clicks through a booking path, their selections are temporarily held in the frontend state.

Terminal Submission: Upon reaching the final "Confirm" node, the backend:

Writes a final row to the "Behavior" sheet.

Creates a new record in the "Appointments/Leads" database.

Dispatches an automated notification.

6. Maintenance & Scalability

Content Updates: Since the FAQ logic is in a JSON file, marketing or support teams can update answers or add new question branches without a developer needing to change the React components.

Global Actions: "Persistent" buttons (like "Start Over" or "Talk to Sales") can be defined globally and rendered on every node regardless of its position in the tree.