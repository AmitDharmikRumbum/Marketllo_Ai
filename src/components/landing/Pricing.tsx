import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: 29,
    desc: "Perfect for solo founders getting started.",
    features: ["1 product", "3 platforms", "15 posts/month", "AI content generation", "Basic analytics"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    price: 49,
    desc: "For startups ready to scale their marketing.",
    features: ["3 products", "All platforms", "Unlimited posts", "Reel generation (voiceover + music)", "AI insights & weekly reports", "Priority support"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Agency",
    price: 149,
    desc: "For agencies managing multiple clients.",
    features: ["Unlimited products", "All platforms", "Unlimited posts", "Everything in Growth", "White-label reports", "Dedicated account manager"],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-5 md:px-20 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <div className="fu inline-flex items-center gap-2 px-3 py-1.5 bg-[#EDE9FE] rounded-full text-xs font-semibold text-[#6D28D9] mb-4">
            Pricing
          </div>
          <h2 className="fu text-[clamp(28px,3vw,42px)] font-extrabold text-[#0F0E1A] tracking-tight mb-4">
            Start free. Scale as you grow.
          </h2>
          <p className="fu text-base text-[#6C6C8A]">No credit card required. 14-day free trial on all plans.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`fu rounded-2xl border p-7 flex flex-col transition-all ${
                plan.popular
                  ? "border-[#6D28D9] shadow-[0_0_0_4px_rgba(109,40,217,.08),0_8px_32px_rgba(109,40,217,.12)] bg-white relative"
                  : "border-[#EAEAF4] bg-white shadow-[0_2px_8px_rgba(0,0,0,.04)]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#6D28D9] text-white text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-base font-bold text-[#0F0E1A] mb-1">{plan.name}</h3>
                <div className="text-[36px] font-extrabold text-[#0F0E1A] tracking-tight mb-1">
                  ${plan.price}<span className="text-base font-medium text-[#6C6C8A]">/mo</span>
                </div>
                <p className="text-sm text-[#6C6C8A]">{plan.desc}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#3D3D5C]">
                    <span className="w-4 h-4 rounded-full bg-[#D1FAE5] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`w-full py-3 text-sm font-semibold rounded-xl text-center transition-all ${
                  plan.popular
                    ? "bg-[#6D28D9] text-white hover:bg-[#5B21B6] hover:shadow-[0_6px_20px_rgba(109,40,217,.35)] hover:-translate-y-px"
                    : "bg-[#EDE9FE] text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
