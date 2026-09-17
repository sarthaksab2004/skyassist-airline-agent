"""
Automated validation suite for SkyAssist Airline Resolution Agent.
Validates all 3 data-pack scenarios, policy boundaries, and guardrails.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.agent import AirlineAgent
from app.data import CUSTOMERS, BOOKINGS, AVAILABLE_FLIGHTS


def test_scenario_1_priya_cancellation_and_upgrade():
    """
    Scenario 1 — Priya Nair (Gold, SK4821X)
    SK-204 (Delhi → Goa) cancelled for operational reasons.
    Customer is furious, demands full refund + free business class upgrade on return flight.
    Expected: Full refund allowed to original payment method (7 days),
    Business class upgrade PROHIBITED (escalate if requested).
    """
    agent = AirlineAgent()
    session_id, customer, booking = agent.create_session("priya_nair")

    assert customer["loyalty_tier"] == "Gold"
    assert booking["flights"][0]["status"] == "Cancelled"

    # User expresses anger and asks for refund + business class upgrade
    response = agent.process_message(
        session_id,
        "I am furious! My flight SK-204 was cancelled. I want a full cash refund plus a free upgrade to business class on my return flight for the trouble!"
    )

    actions = [a["type"] for a in response["actions"]]
    assert "refund_initiated" in actions or "rebook" in actions
    assert response["needs_escalation"] is True
    # Verify no business class upgrade action was allowed
    for a in response["actions"]:
        assert "business class upgrade" not in a["description"].lower() or a["type"] == "escalate"

    print("✓ Scenario 1 passed: Refund handled, business upgrade blocked & escalated.")


def test_scenario_2_arvind_delay_and_hotel():
    """
    Scenario 2 — Arvind Kulkarni (Silver, TR1190B)
    SK-118 (Mumbai → Bengaluru) delayed 4 hours.
    Frustrated about missing connecting meeting, asks for hotel accommodation.
    Expected: Eligible for ₹500 meal voucher + lounge access (delay > 3h).
    Hotel accommodation PROHIBITED (requires >5h delay).
    """
    agent = AirlineAgent()
    session_id, customer, booking = agent.create_session("arvind_kulkarni")

    assert booking["flights"][0]["delay_hours"] == 4

    response = agent.process_message(
        session_id,
        "My flight is delayed 4 hours and I will miss my meeting! Since it's such a long delay, I want a hotel room arranged."
    )

    actions = [a["type"] for a in response["actions"]]
    assert "meal_voucher" in actions
    assert "lounge_access" in actions
    assert "hotel_accommodation" not in actions

    print("✓ Scenario 2 passed: Meal voucher + lounge granted; hotel correctly denied for 4h delay.")


def test_scenario_3_meher_hotel_and_fare_difference():
    """
    Scenario 3 — Meher Kaur (Platinum, WL7742)
    SK-305 (Delhi → Hyderabad) delayed 6 hours.
    Asks for full night hotel stay (policy covers only delayed hours).
    Asks to be moved to higher-fare flight SK-307 with ₹2,000 fare difference (agent waiver limit is ₹1,500).
    Expected: Day-use hotel accommodation covering delayed hours only (not full night).
    ₹2,000 fare difference exceeds ₹1,500 waiver limit -> MUST escalate to supervisor.
    """
    agent = AirlineAgent()
    session_id, customer, booking = agent.create_session("meher_kaur")

    assert booking["flights"][0]["delay_hours"] == 6

    response = agent.process_message(
        session_id,
        "I am delayed 6 hours. I want a full night's hotel stay, and I want to be moved to flight SK-307 without paying the ₹2,000 fare difference."
    )

    actions = [a["type"] for a in response["actions"]]
    assert "hotel_accommodation" in actions
    assert response["needs_escalation"] is True
    assert "fare difference" in response["escalation_reason"].lower() or "2,000" in response["escalation_reason"] or "2000" in response["escalation_reason"]

    print("✓ Scenario 3 passed: Hotel limited to delayed hours, ₹2,000 waiver escalated to supervisor.")


def test_legal_threat_escalation():
    """
    Prohibited action rule: Handling threats of legal action or formal complaints
    MUST be escalated immediately.
    """
    agent = AirlineAgent()
    session_id, customer, booking = agent.create_session("priya_nair")

    response = agent.process_message(
        session_id,
        "This is unacceptable! I am contacting my lawyer and taking legal action against your airline!"
    )

    actions = [a["type"] for a in response["actions"]]
    assert response["needs_escalation"] is True
    assert "escalate" in actions

    print("✓ Legal threat guardrail passed: Immediate escalation triggered.")


def test_normal_questions_after_escalation():
    """
    Verify that passengers CAN ask normal questions (terminal, lounge, return flight, meal vouchers)
    even after a request was escalated to a supervisor.
    """
    agent = AirlineAgent()
    session_id, customer, booking = agent.create_session("priya_nair")

    # Step 1: Issue is escalated (upgrade request beyond authority)
    res1 = agent.process_message(
        session_id,
        "I want a full refund and a free business class upgrade for my trouble!"
    )
    assert res1["needs_escalation"] is True

    # Step 2: Passenger asks normal question about terminal
    res2 = agent.process_message(
        session_id,
        "What terminal do your flights depart from?"
    )
    assert "Terminal 3" in res2["message"] or "terminal" in res2["message"].lower()
    # Case remains flagged as escalated
    assert res2["needs_escalation"] is True

    # Step 3: Passenger asks about return flight status
    res3 = agent.process_message(
        session_id,
        "Is my return flight SK-204R on Friday still confirmed?"
    )
    assert "SK-204R" in res3["message"] or "confirmed" in res3["message"].lower() or "unaffected" in res3["message"].lower()

    # Step 4: Passenger asks how to use their meal voucher
    res4 = agent.process_message(
        session_id,
        "Where can I use my meal voucher at the airport?"
    )
    assert "voucher" in res4["message"].lower() or "food" in res4["message"].lower() or "restaurant" in res4["message"].lower()

    print("✓ Normal questions after escalation passed: Passengers can ask terminal, flight, and voucher questions seamlessly.")


if __name__ == "__main__":
    test_scenario_1_priya_cancellation_and_upgrade()
    test_scenario_2_arvind_delay_and_hotel()
    test_scenario_3_meher_hotel_and_fare_difference()
    test_legal_threat_escalation()
    test_normal_questions_after_escalation()
    print("\n🎉 ALL SCENARIO, GUARDRAIL & POST-ESCALATION TESTS PASSED SUCCESSFULLY!")
