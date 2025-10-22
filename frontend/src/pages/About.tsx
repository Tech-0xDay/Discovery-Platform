import { Card } from '@/components/ui/card';
import { Rocket, Shield, Award, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">About 0x.ship</h1>
          <p className="text-xl text-muted-foreground">
            Proof-weighted discovery platform for hackathon projects
          </p>
        </div>

        <Card className="mb-8 p-8">
          <h2 className="mb-4 text-2xl font-semibold">Our Mission</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            0x.ship is a Reddit-style discovery platform designed specifically for hackathon projects. We use a
            proof-based credibility system to surface the most authentic and impactful projects, helping builders
            connect with opportunities, collaborators, and recognition they deserve.
          </p>
        </Card>

        <div className="mb-12 grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <Shield className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-xl font-semibold">Proof-Based Credibility</h3>
            <p className="text-muted-foreground">
              Our unique scoring system evaluates projects based on verification, community engagement, validation
              badges, and quality metrics.
            </p>
          </Card>

          <Card className="p-6">
            <Award className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-xl font-semibold">Recognition System</h3>
            <p className="text-muted-foreground">
              Curators and admins can award silver, gold, and platinum badges to exceptional projects, providing
              instant credibility.
            </p>
          </Card>

          <Card className="p-6">
            <Users className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-xl font-semibold">Network Effect</h3>
            <p className="text-muted-foreground">
              Request intros to project creators, vote on favorites, and engage in meaningful discussions about
              innovative ideas.
            </p>
          </Card>

          <Card className="p-6">
            <Rocket className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-xl font-semibold">Web3 Native</h3>
            <p className="text-muted-foreground">
              Built with blockchain technology at its core, featuring wallet integration and on-chain verification for
              hackathon credentials.
            </p>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="mb-4 text-2xl font-semibold">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold">What is a proof score?</h3>
              <p className="text-muted-foreground">
                The proof score is a composite metric that combines verification (blockchain certificates), community
                votes, curator validation badges, and automated quality assessment.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">How do I get my project featured?</h3>
              <p className="text-muted-foreground">
                Projects with high proof scores and validation badges from curators are more likely to be featured.
                Focus on building quality projects with proper documentation and community engagement.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">Can I connect my wallet?</h3>
              <p className="text-muted-foreground">
                Yes! Connect your wallet to verify your builder credentials and increase your proof score through
                on-chain hackathon certificates.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
