# Interactive Exam System - Requirements Documentation
**Version:** 1.0  
**Date:** February 5, 2026  
**Author:** George  
**Project Type:** General-Purpose Adaptive Learning Platform  

---

# Table of Contents

1. [User Requirements Document (URD)](#1-user-requirements-document-urd)
2. [Software Requirements Specification (SRS)](#2-software-requirements-specification-srs)
3. [Functional Requirements Specification (FRS)](#3-functional-requirements-specification-frs)
4. [Product Requirements Document (PRD)](#4-product-requirements-document-prd)
5. [Technical Architecture Document](#5-technical-architecture-document)
6. [Use Cases & User Stories](#6-use-cases--user-stories)
7. [Data Dictionary & JSON Schema Specification](#7-data-dictionary--json-schema-specification)
8. [Appendices](#8-appendices)

---

# 1. User Requirements Document (URD)

## 1.1 Executive Summary

The Interactive Exam System is a general-purpose, AI-enhanced assessment platform designed to support both educational learning and professional training. The system provides two distinct modes: **Practice Mode** for iterative learning with AI coaching, and **Assessment Mode** for formal evaluation. The platform is designed for dual deployment - local HTML files for home use and intranet deployment for office use at JG Summit Holdings.

## 1.2 Business Context

### 1.2.1 Problem Statement
Current examination and training methods lack:
- Personalized, immediate feedback for learners
- Ability to practice iteratively with guidance
- Flexible deployment for both home and corporate environments
- Reusable framework across diverse subjects and contexts
- AI-assisted coaching that guides without revealing answers

### 1.2.2 Target Users

| User Group | Context | Primary Needs |
|------------|---------|---------------|
| **Children (Home)** | Mathematics, statistics, general education | Interactive practice, patient coaching, self-paced learning |
| **Audit Team (Office)** | AI training, data analytics, audit methodologies | Professional assessment, skill validation, training documentation |
| **General Students** | Various subjects | Flexible exam platform, multiple attempt practice |

### 1.2.3 User Personas

**Persona 1: Sarah (Age 12, Student)**
- Learning statistics and probability
- Needs encouragement and hints when stuck
- Benefits from unlimited practice attempts
- Parents monitor progress

**Persona 2: Miguel (Audit Professional)**
- Completing 26-week AI audit training
- Needs formal assessments for certification
- Values detailed feedback on errors
- Time-constrained during workday

**Persona 3: George (Super Admin)**
- Creates exams for multiple audiences
- Manages exam deployment and results
- Configures LLM providers
- Reviews overall performance metrics

## 1.3 User Requirements

### UR-001: Dual-Mode Learning System
**Priority:** MUST HAVE  
**Description:** Users must be able to choose between Practice Mode (learning-focused) and Assessment Mode (evaluation-focused) for any exam.

**Acceptance Criteria:**
- Mode selection available before starting exam
- Each mode has distinct behavior as specified
- Users can switch between modes for different sessions
- Mode selection is clear and unambiguous

### UR-002: AI-Powered Coaching (Practice Mode)
**Priority:** MUST HAVE  
**Description:** When users answer incorrectly in Practice Mode, the system must provide coaching hints that guide them toward the correct answer without revealing it.

**Acceptance Criteria:**
- Hints are progressively more specific
- Maximum 3 hints per question
- LLM identifies common mistakes and provides targeted guidance
- Coaching is encouraging and supportive in tone
- No correct answers are revealed during practice

### UR-003: AI-Powered Grading (Assessment Mode)
**Priority:** MUST HAVE  
**Description:** When users submit answers in Assessment Mode, the system must provide comprehensive feedback including correct answers and explanations.

**Acceptance Criteria:**
- Objective questions (MC, T/F) are auto-graded instantly
- Text responses are evaluated by LLM
- Detailed feedback shows correct answer and why user's answer was wrong
- Scoring breakdown provided by question
- One attempt only per question

### UR-004: Flexible Exam Loading
**Priority:** MUST HAVE  
**Description:** Super Admin must be able to load exam files from various sources depending on deployment context.

**Acceptance Criteria:**
- Local file upload (JSON)
- Paste JSON directly into interface
- Select from local directory (home use)
- Select from SharePoint directory (office use)
- Clear error messages for invalid exam files

### UR-005: Multi-User Support with Privacy
**Priority:** MUST HAVE  
**Description:** Multiple users must be able to use the system independently with their own progress and results.

**Acceptance Criteria:**
- Users see only exams assigned to them
- Progress is tracked per user
- Results are private to each user
- Users can identify completed vs. incomplete exams
- Users can retake exams unlimited times

### UR-006: Results Export
**Priority:** MUST HAVE  
**Description:** Super Admin must be able to export exam results for analysis and record-keeping.

**Acceptance Criteria:**
- Export to CSV format
- Admin selects destination directory
- Export includes user ID, exam ID, scores, timestamps
- Option to export individual or aggregate results

### UR-007: White-Label Customization
**Priority:** SHOULD HAVE  
**Description:** System should support custom branding and themes for different deployment contexts.

**Acceptance Criteria:**
- Customizable color scheme
- Logo/branding replacement
- Custom welcome messages
- Theme saved per deployment

### UR-008: LLM Provider Flexibility
**Priority:** MUST HAVE  
**Description:** Super Admin must be able to configure different LLM providers based on deployment context.

**Acceptance Criteria:**
- Support for Claude (Anthropic API)
- Support for OpenAI (GPT-4o-mini)
- Support for Ollama/LM Studio (local)
- Provider selection in Super Admin settings
- Clear indication when LLM unavailable or quota exceeded

### UR-009: Offline Capability (Home Use)
**Priority:** SHOULD HAVE  
**Description:** System should work offline when using local LLM providers.

**Acceptance Criteria:**
- No internet required when Ollama/LM Studio configured
- Exam files loaded from local filesystem
- Results saved locally
- Clear messaging about offline mode limitations

### UR-010: Performance Constraints
**Priority:** MUST HAVE  
**Description:** System must handle specified concurrent user loads.

**Acceptance Criteria:**
- 1 concurrent user (home deployment)
- 10 concurrent users (office deployment)
- Response time < 2 seconds for question navigation
- LLM response time < 30 seconds per evaluation

---

