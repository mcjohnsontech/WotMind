# Wotmind

Operational intelligence powered by trust.

---

# Overview

Wotmind is an AI-powered orchestration platform that enables MSMEs to automate business decisions, verification workflows, and financial execution using intelligent workflow pipelines.

The platform combines:

- AI reasoning
- Trust verification
- Workflow orchestration
- Squad payment infrastructure
- Explainable audit systems

Wotmind transforms business operations into programmable financial workflows.

---

# Core Concept

Wotmind operates on a modular workflow system:

Trigger → AI Logic → Trust Verification → Financial Action → Audit Logging

Example:

Receipt Upload
→ OCR Extraction
→ Fraud/Anomaly Checks
→ Squad Transfer
→ Audit Trail Update

---

# Hackathon Alignment

Theme:
Smart Systems: The Intelligent Economy

Challenge:
Proof of Life (Verification & Trust)

Wotmind addresses this by embedding verification directly into operational finance through:

- OCR validation
- anomaly detection
- trust scoring
- explainable AI reasoning
- transaction verification
- approval safeguards

---

# Core Features

## 1. Workflow Engine

Businesses create intelligent workflows using modular nodes.

### Node Types

#### Triggers
Business events that start workflows.

Examples:
- Receipt upload
- WhatsApp message
- Squad webhook
- Spreadsheet update
- Inventory threshold
- Time-based events

#### AI Logic Nodes
AI reasoning and interpretation layer.

Examples:
- OCR extraction
- Policy enforcement
- Invoice parsing
- Fraud detection
- Spending analysis
- Forecasting

#### Trust Verification Nodes
Proof-of-life validation system.

Examples:
- Duplicate receipt checks
- Vendor trust scoring
- Amount anomaly detection
- Approval validation
- Historical consistency analysis

#### Squad Action Nodes
Financial execution layer.

Examples:
- Transfer API
- Virtual Account creation
- Payment Link generation
- Transaction confirmation

---

# Primary Demo Workflow

## Logistics Fuel Reimbursement

### Flow

Driver uploads fuel receipt
→ AI extracts receipt data
→ Verification engine validates transaction
→ Trust engine checks anomaly risk
→ Squad transfer executes automatically
→ Audit log updates

### Verification Signals

- Approved vendor check
- Duplicate receipt detection
- Amount anomaly detection
- OCR confidence scoring
- Historical behavior comparison

---

# Technical Stack

## Frontend

- Next.js
- Tailwind CSS
- React Flow

## Backend

- Node.js
- Express.js

## Database

- Supabase

## AI Layer

- Gemini 2.5 Flash

## Payment Infrastructure

- Squad API

---

# System Architecture

Frontend
↓
API Layer
↓
Workflow Engine
↓
AI Logic Layer
↓
Trust Verification Engine
↓
Squad Financial Actions
↓
Audit Logging System

---

# Database Schema

## workflows

```sql
id
user_id
name
status
created_at
updated_at