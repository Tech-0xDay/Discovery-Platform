import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ArrowRight, Building2, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const PLANS = [
  {
    id: 'free',
    name: 'Free Tier',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Browse all projects',
      'Request intros to builders',
      'Direct messaging',
      'Basic analytics',
      'Unlimited access (limited time only!)',
    ],
    limitations: [],
    available: true,
    popular: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$99',
    period: 'per month',
    description: 'For active investors',
    features: [
      'Everything in Free',
      'Advanced project filters',
      'Priority intro requests',
      'Monthly builder insights report',
      'Early access to featured projects',
      'Verified investor badge',
    ],
    limitations: [],
    available: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For investment firms',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom deal flow pipeline',
      'Team collaboration tools',
      'White-label options',
      'API access',
      'Custom integrations',
    ],
    limitations: [],
    available: false,
  },
];

export default function InvestorPlans() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    linkedin_url: '',
    reason: '',
  });

  const handleApply = async (planId: string) => {
    if (!user) {
      toast.info('Please login or signup to apply for investor access');
      navigate('/login', { state: { from: '/investor-plans' } });
      return;
    }

    // Check if user already has a pending or approved request
    try {
      const response = await fetch('/api/investor-requests/my-request', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      if (data.status === 'success' && data.data) {
        if (data.data.status === 'pending') {
          toast.info('Your investor request is under review by admin');
          navigate('/');
          return;
        } else if (data.data.status === 'approved') {
          toast.success('You are already an approved investor!');
          navigate('/');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking request status:', error);
    }

    setSelectedPlan(planId);
  };

  const handleSubmit = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const response = await fetch('/api/investor-requests/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          plan_type: selectedPlan,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast.success('Application submitted successfully! Your request is under review. Once approved, you will have access to request intros from project builders.');
        navigate('/');
      } else {
        toast.error(data.message || 'Failed to submit application');
      }
    } catch (error) {
      toast.error('Failed to submit application');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedPlan) {
    const plan = PLANS.find((p) => p.id === selectedPlan);

    return (
      <div className="min-h-screen bg-background pt-20 px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="card-elevated p-8 md:p-10">
            {/* Header */}
            <div className="flex items-start gap-4 mb-8">
              <div className="h-12 w-12 rounded-[15px] bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border-2 border-primary/50 flex-shrink-0">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-black mb-2">Apply for {plan?.name}</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Tell us about yourself and why you want to become an investor on 0x.ship
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Company/Fund Name <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="input-primary w-full"
                  placeholder="e.g., Acme Ventures"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  LinkedIn Profile <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="input-primary w-full"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Why do you want investor access? <span className="text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="input-primary w-full min-h-[120px]"
                  placeholder="Tell us about your investment thesis, portfolio, or what you're looking for..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Back
                </button>
                <button onClick={handleSubmit} className="btn-primary flex-1" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary/50 rounded-full mb-4 shadow-lg">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-black text-primary tracking-wide">INVESTOR ACCESS</span>
          </div>
          <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Choose Your Plan
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get access to vetted hackathon projects, connect with talented builders, and discover the next big thing
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`card-elevated p-8 relative hover:shadow-2xl transition-all group ${
                plan.popular ? 'ring-4 ring-primary ring-offset-4 ring-offset-background scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-5 py-2 bg-gradient-to-r from-primary to-accent text-foreground text-sm font-black rounded-full border-4 border-background shadow-lg flex items-center gap-1.5">
                  <Zap className="h-4 w-4" />
                  RECOMMENDED
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-black mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  {plan.period && <span className="text-muted-foreground text-sm font-medium">/ {plan.period}</span>}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 group/item">
                    <div className="mt-0.5 h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 font-bold" />
                    </div>
                    <span className="text-xs font-medium leading-relaxed flex-1">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 opacity-40">
                    <div className="mt-0.5 h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <X className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-xs flex-1">{limitation}</span>
                  </div>
                ))}
              </div>

              {plan.available ? (
                <button
                  onClick={() => handleApply(plan.id)}
                  className="btn-primary w-full group/btn hover:scale-105 transition-transform gap-2 py-2.5 text-sm"
                >
                  <span className="font-bold">Get Started</span>
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button disabled className="btn-secondary w-full opacity-50 cursor-not-allowed py-2.5 text-sm">
                  Coming Soon
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="card-elevated p-8 text-center bg-gradient-to-r from-secondary/50 to-secondary/30 border-2 border-primary/20">
          <Sparkles className="h-10 w-10 mx-auto mb-3 text-primary" />
          <h2 className="text-2xl font-black mb-3">Not sure which plan is right for you?</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-2xl mx-auto">
            Start with the free tier and upgrade anytime as your needs grow
          </p>
          <button
            onClick={() => handleApply('free')}
            className="btn-primary gap-2 py-2 px-6 hover:scale-105 transition-transform group text-sm"
          >
            <Zap className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            <span className="font-bold">Start with Free Tier</span>
          </button>
        </div>
      </div>
    </div>
  );
}
