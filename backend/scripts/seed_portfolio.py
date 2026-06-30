import sys
import os
from datetime import datetime

# Add the root backend folder to sys.path to allow imports when running directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.db.database import SessionLocal
from app.models.profile import Profile
from app.models.portfolio import Skill, Experience, Project, Education, Certification
from app.core.default_seed_data import (
    PROFILE_SEED,
    SKILLS_SEED,
    EXPERIENCE_SEED,
    PROJECTS_SEED,
    EDUCATION_SEED,
    CERTIFICATIONS_SEED
)

def seed_portfolio():
    if not settings.ENABLE_DEFAULT_SEED:
        print("Default seed is disabled. Set ENABLE_DEFAULT_SEED=true to run seeding.")
        return

    print("Seeding portfolio data...")
    db = SessionLocal()
    try:
        # Seed Profile (only one row expected, update if exists)
        profile = db.query(Profile).first()
        if profile:
            for key, value in PROFILE_SEED.items():
                setattr(profile, key, value)
        else:
            profile = Profile(**PROFILE_SEED)
            db.add(profile)
        db.commit()
        print("Profile seeded/updated")

        # Seed Skills
        for skill_data in SKILLS_SEED:
            existing = db.query(Skill).filter_by(
                name=skill_data["name"], 
                category=skill_data["category"]
            ).first()
            if existing:
                for key, value in skill_data.items():
                    setattr(existing, key, value)
            else:
                db.add(Skill(**skill_data))
        db.commit()
        print("Skills seeded/updated")

        # Seed Experience
        for exp_data in EXPERIENCE_SEED:
            start_date = datetime.strptime(exp_data["start_date"], "%Y-%m-%d").date()
            end_date = datetime.strptime(exp_data["end_date"], "%Y-%m-%d").date() if exp_data["end_date"] else None
            
            existing = db.query(Experience).filter_by(
                company_name=exp_data["company_name"],
                role=exp_data["role"]
            ).first()
            
            if existing:
                for key, value in exp_data.items():
                    if key in ["start_date", "end_date"]:
                        continue
                    setattr(existing, key, value)
                existing.start_date = start_date
                existing.end_date = end_date
            else:
                new_exp = {**exp_data, "start_date": start_date, "end_date": end_date}
                db.add(Experience(**new_exp))
        db.commit()
        print("Experience seeded/updated")

        # Seed Projects (match by stable seed_key first so renames update in place
        # instead of creating duplicates; fall back to title for legacy rows).
        for proj_data in PROJECTS_SEED:
            existing = None
            if proj_data.get("seed_key"):
                existing = db.query(Project).filter_by(seed_key=proj_data["seed_key"]).first()
            if not existing:
                existing = db.query(Project).filter_by(title=proj_data["title"]).first()
            if existing:
                for key, value in proj_data.items():
                    setattr(existing, key, value)
            else:
                db.add(Project(**proj_data))
        db.commit()
        print("Projects seeded/updated")

        # Seed Education
        for edu_data in EDUCATION_SEED:
            existing = db.query(Education).filter_by(
                institution_name=edu_data["institution_name"],
                degree=edu_data["degree"]
            ).first()
            if existing:
                for key, value in edu_data.items():
                    setattr(existing, key, value)
            else:
                db.add(Education(**edu_data))
        db.commit()
        print("Education seeded/updated")

        # Seed Certifications
        for cert_data in CERTIFICATIONS_SEED:
            existing = db.query(Certification).filter_by(
                title=cert_data["title"],
                issuer=cert_data["issuer"]
            ).first()
            if existing:
                for key, value in cert_data.items():
                    setattr(existing, key, value)
            else:
                db.add(Certification(**cert_data))
        db.commit()
        print("Certifications seeded/updated")

        # Ensure a single site-settings row exists (feature flags default ON).
        from app.repositories.settings import get_or_create_settings
        get_or_create_settings(db)
        print("Site settings ensured")

        print("Portfolio default seed completed successfully.")
        print("You can now update this data from the admin dashboard.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_portfolio()
