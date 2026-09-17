"""
Structured data for the SkyWay Airlines Resolution Agent.
All data sourced from the assignment brief — no invented rules or facts.
Exercise date: Wednesday, 23 September 2026.
"""
from __future__ import annotations

CURRENT_DATE = "Wednesday, 23 September 2026"
AIRLINE_NAME = "SkyWay Airlines"

# ─────────────────────────────────────────────
# 1. Customer Profiles
# ─────────────────────────────────────────────
CUSTOMERS = {
    "priya_nair": {
        "id": "priya_nair",
        "name": "Priya Nair",
        "loyalty_tier": "Gold",
        "booking_reference": "SK4821X",
        "email": "priya.nair@example.com",
        "phone": "+91-98xxxxxxx1",
        "travel_history": {
            "flights_last_12_months": 6,
            "prior_complaints": [
                {
                    "type": "Delayed Baggage",
                    "resolution": "Voucher issued"
                }
            ]
        }
    },
    "arvind_kulkarni": {
        "id": "arvind_kulkarni",
        "name": "Arvind Kulkarni",
        "loyalty_tier": "Silver",
        "booking_reference": "TR1190B",
        "email": "arvind.kulkarni@example.com",
        "phone": "+91-98xxxxxxx2",
        "travel_history": {
            "flights_last_12_months": 3,
            "prior_complaints": []
        }
    },
    "meher_kaur": {
        "id": "meher_kaur",
        "name": "Meher Kaur",
        "loyalty_tier": "Platinum",
        "booking_reference": "WL7742",
        "email": "meher.kaur@example.com",
        "phone": "+91-98xxxxxxx3",
        "travel_history": {
            "flights_last_12_months": 10,
            "prior_complaints": [
                {
                    "type": "Overbooking",
                    "resolution": "Tier-status upgrade"
                }
            ]
        }
    }
}

# ─────────────────────────────────────────────
# 2. Booking / Transaction Data
# ─────────────────────────────────────────────
BOOKINGS = {
    "SK4821X": {
        "customer_id": "priya_nair",
        "pnr": "SK4821X",
        "flights": [
            {
                "flight_number": "SK-204",
                "route": "Delhi → Goa",
                "date": "Wed 23 Sep 2026",
                "scheduled_departure": "18:40",
                "status": "Cancelled",
                "status_reason": "Operational reasons",
                "new_departure": None,
                "delay_hours": None
            },
            {
                "flight_number": "SK-204R",
                "route": "Goa → Delhi",
                "date": "Fri 25 Sep 2026",
                "scheduled_departure": "16:20",
                "status": "Unaffected",
                "status_reason": None,
                "new_departure": None,
                "delay_hours": None
            }
        ]
    },
    "TR1190B": {
        "customer_id": "arvind_kulkarni",
        "pnr": "TR1190B",
        "flights": [
            {
                "flight_number": "SK-118",
                "route": "Mumbai → Bengaluru",
                "date": "Wed 23 Sep 2026",
                "scheduled_departure": "07:10",
                "status": "Delayed",
                "status_reason": "Delayed 4 hours",
                "new_departure": "11:10",
                "delay_hours": 4
            }
        ]
    },
    "WL7742": {
        "customer_id": "meher_kaur",
        "pnr": "WL7742",
        "flights": [
            {
                "flight_number": "SK-305",
                "route": "Delhi → Hyderabad",
                "date": "Wed 23 Sep 2026",
                "scheduled_departure": "14:00",
                "status": "Delayed",
                "status_reason": "Delayed 6 hours",
                "new_departure": "20:00",
                "delay_hours": 6
            }
        ]
    }
}

# ─────────────────────────────────────────────
# Available flights for rebooking
# ─────────────────────────────────────────────
AVAILABLE_FLIGHTS = {
    "Delhi → Goa": [
        {
            "flight_number": "SK-206",
            "route": "Delhi → Goa",
            "date": "Wed 23 Sep 2026",
            "departure": "21:30",
            "seats_available": 12,
            "fare_class": "Economy",
            "fare_difference": 0
        },
        {
            "flight_number": "SK-208",
            "route": "Delhi → Goa",
            "date": "Thu 24 Sep 2026",
            "departure": "08:15",
            "seats_available": 34,
            "fare_class": "Economy",
            "fare_difference": 0
        }
    ],
    "Delhi → Hyderabad": [
        {
            "flight_number": "SK-307",
            "route": "Delhi → Hyderabad",
            "date": "Wed 23 Sep 2026",
            "departure": "16:30",
            "seats_available": 8,
            "fare_class": "Economy",
            "fare_difference": 2000
        },
        {
            "flight_number": "SK-309",
            "route": "Delhi → Hyderabad",
            "date": "Thu 24 Sep 2026",
            "departure": "09:00",
            "seats_available": 25,
            "fare_class": "Economy",
            "fare_difference": 0
        }
    ],
    "Mumbai → Bengaluru": [
        {
            "flight_number": "SK-120",
            "route": "Mumbai → Bengaluru",
            "date": "Wed 23 Sep 2026",
            "departure": "13:00",
            "seats_available": 20,
            "fare_class": "Economy",
            "fare_difference": 0
        }
    ]
}

# ─────────────────────────────────────────────
# 3. Service Rules / Policies
# ─────────────────────────────────────────────
SERVICE_POLICIES = """
CANCELLATION REBOOKING RULE:
If a flight is cancelled by the airline, the customer is entitled to a free rebooking on the next available flight within 24 hours, or a full refund — customer's choice.

DELAY COMPENSATION RULE:
- Delay under 3 hours → ₹500 meal voucher
- Delay 3+ hours → Meal voucher + lounge access
- Delay 5+ hours → Meal voucher + hotel accommodation (covering ONLY the delayed hours, NOT a full night's stay)

REFUND PROCESSING RULE:
Refunds for airline-caused cancellations are processed in full within 7 business days. Refunds are issued to the ORIGINAL payment method ONLY.

FARE DIFFERENCE RULE:
If a customer voluntarily chooses to rebook on a higher-fare flight (not airline-caused), they must pay the fare difference. Agents CANNOT waive fare differences above ₹1,500 without supervisor approval.

LOYALTY TIER RULE:
Gold and Platinum tier customers get priority rebooking (first access to next-available seats) but NO additional compensation beyond the standard policy.
"""

# ─────────────────────────────────────────────
# 4. Allowed vs. Prohibited Actions
# ─────────────────────────────────────────────
ALLOWED_ACTIONS = [
    "Rebook the customer on the next available flight within 24 hours at no charge (airline-caused disruption)",
    "Issue meal vouchers and lounge access per the delay compensation rule",
    "Arrange hotel accommodation for the delayed-hours portion, where the delay qualifies",
    "Initiate a refund request for airline-caused cancellations",
    "Provide the customer's own booking and flight status information"
]

PROHIBITED_ACTIONS = [
    "Approving any compensation beyond the stated policy amounts",
    "Waiving a fare difference above ₹1,500",
    "Making exceptions for non-airline-caused disruptions (e.g., customer missed the flight)",
    "Handling threats of legal action or formal complaints — must be escalated immediately",
    "Processing refunds to a different payment method than the original"
]

# ─────────────────────────────────────────────
# Helper functions
# ─────────────────────────────────────────────
def get_customer_by_id(customer_id: str) -> dict | None:
    """Look up a customer by their internal ID."""
    return CUSTOMERS.get(customer_id)


def get_customer_by_pnr(pnr: str) -> dict | None:
    """Look up a customer by their PNR/booking reference."""
    booking = BOOKINGS.get(pnr)
    if booking:
        return CUSTOMERS.get(booking["customer_id"])
    return None


def get_booking(pnr: str) -> dict | None:
    """Get booking data by PNR."""
    return BOOKINGS.get(pnr)


def get_available_flights(route: str) -> list:
    """Get available alternative flights for a route."""
    return AVAILABLE_FLIGHTS.get(route, [])
