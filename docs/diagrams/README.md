# UML Diagrams — BharatLCL

This directory contains all UML design diagrams for the BharatLCL platform.

## Diagrams to Create

Create these diagrams using **Draw.io** (https://app.diagrams.net/) or **StarUML** and export as PNG:

| Diagram | File Name | Description |
|---------|-----------|-------------|
| **Class Diagram** | `class-diagram.png` | Entity relationships: User, Container, Shipment, Payment, Document, Verification |
| **Use Case Diagram** | `use-case-diagram.png` | Actor interactions: Exporter, Transporter, Admin, ULIP System |
| **Sequence Diagram** | `sequence-diagram.png` | Booking flow: Search → Book → Pay → Track → Deliver |
| **State Chart** | `state-chart.png` | Shipment status transitions: Booked → Picked Up → In Transit → At Port → Delivered |
| **Architecture Diagram** | `architecture.png` | 3-tier architecture: React → Express → MongoDB with external integrations |

## How to Create

1. Go to [Draw.io](https://app.diagrams.net/)
2. Select **Create New Diagram**
3. Use the UML templates for class, sequence, and state diagrams
4. Refer to `docs/SDD.md` Section 7 for detailed specifications
5. Export as **PNG** (File → Export As → PNG)
6. Save to this directory with the exact filenames listed above

## Text Versions

Refer to the **SDD document** (`docs/SDD.md`) for text-based versions of:
- Class Diagram (Section 7.3)
- Sequence Diagrams (Section 7.1)
- State Charts (Section 7.2)
- Component Diagram (Section 3.2)
