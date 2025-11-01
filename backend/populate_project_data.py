"""
Populate sample data for a test project to demonstrate all new fields
"""
import sys
sys.path.insert(0, '.')

from app import app
from extensions import db
from models.project import Project

with app.app_context():
    # Find the test project
    project = Project.query.filter(
        Project.title.like('%Test Multi-Category%')
    ).first()

    if not project:
        print("Test project not found!")
        exit(1)

    print(f"Updating project: {project.title}")

    # Add sample data for all new fields
    project.project_story = """Our journey began at a hackathon in early 2024 when we realized there was a gap in the market for multi-category project management.

We started with a simple MVP that could handle basic categorization, but quickly realized users needed much more. Over the next few months, we:

1. Conducted 50+ user interviews
2. Rebuilt the architecture 3 times
3. Integrated with 10+ APIs
4. Tested with 1000+ beta users

The biggest challenge was creating an intuitive UI that didn't overwhelm users with options. We went through 20+ design iterations before landing on our current approach.

Today, we're proud to have a solution that handles complex workflows while remaining simple to use."""

    project.inspiration = """The spark came during a late-night coding session when our team was struggling to categorize a project that fit multiple domains.

We were building something that was part AI, part blockchain, and part developer tooling. Existing platforms forced us to pick just one category, making it hard for the right audience to discover our work.

That's when it hit us: "What if projects could embrace their multi-faceted nature instead of being boxed into single categories?"

The next morning, we started sketching out what would become this platform."""

    project.pitch_deck_url = "https://gateway.pinata.cloud/ipfs/bafybeiclify3bqufnyc26z2yj6kauwbkryq6yihfjduzqzc44dl4axz6ci"

    project.market_comparison = """Compared to existing solutions:

**vs. ProductHunt**: While ProductHunt is great for launching products, it lacks deep technical categorization and validation systems.

**vs. GitHub**: GitHub is perfect for code hosting but doesn't provide the showcase and community features builders need.

**vs. DevPost**: DevPost focuses on hackathons but doesn't have the ongoing community engagement and validation we offer.

**Our Advantage**: We combine the best of all worlds - technical validation, multi-category support, community engagement, and a focus on the builder's journey, not just the end product."""

    project.novelty_factor = """What makes us unique:

🎯 **Multi-Category System**: First platform to let projects embrace multiple domains simultaneously

🔐 **Validator Network**: Community-driven validation with category-specific expertise

✨ **Builder Journey**: We showcase the story, not just the product

🏆 **Proof-of-Work Scoring**: Objective metrics based on actual work, not just hype

⚡ **Real-time Everything**: Instant updates, live validation, dynamic rankings

🌐 **Web3 Native**: Built with blockchain verification but accessible to all"""

    db.session.commit()

    print("✓ Sample data added successfully!")
    print("\nProject now has:")
    print(f"  - Categories: {project.categories}")
    print(f"  - Project Story: {'YES' if project.project_story else 'NO'}")
    print(f"  - Inspiration: {'YES' if project.inspiration else 'NO'}")
    print(f"  - Pitch Deck: {'YES' if project.pitch_deck_url else 'NO'}")
    print(f"  - Market Comparison: {'YES' if project.market_comparison else 'NO'}")
    print(f"  - Novelty Factor: {'YES' if project.novelty_factor else 'NO'}")
    print("\n✓ Visit the project detail page to see all sections displayed!")
