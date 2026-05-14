import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function clamp(n: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, n)); }

export async function POST(request: NextRequest) {
  try {
    const b = await request.json();
    const tech  = Number(b.technicalScore  ?? 50);
    const seo   = Number(b.seoScore        ?? 50);
    const func_ = Number(b.functionalScore ?? 50);
    const user  = Number(b.userScore       ?? 50);
    const speed = Number(b.pagespeedScore  ?? 50);
    const kwCov = Number(b.keywordCoverage ?? 0);
    const issues = Number(b.issueCount     ?? 0);

    const composite  = tech*0.25 + seo*0.30 + speed*0.20 + kwCov*0.15 + func_*0.10;
    const adjusted   = clamp(composite - Math.min(issues * 3, 20));

    const [minPos, maxPos] =
      adjusted >= 80 ? [1,5]   : adjusted >= 70 ? [3,10]  :
      adjusted >= 60 ? [8,20]  : adjusted >= 50 ? [15,40] :
      adjusted >= 40 ? [30,70] : [50,100];

    const confidence  = adjusted >= 70 ? "high" : adjusted >= 50 ? "medium" : "low";
    const trajectory  = adjusted >= 70 ? "improving" : adjusted >= 45 ? "stable" : "declining";
    const mid         = Math.round((minPos + maxPos) / 2);

    const factors = [
      { name:"SEO Optimization",  weight:30, score:seo,   impact: seo>=70?"positive":seo>=50?"neutral":"negative",   description: seo>=70  ?"Strong meta tags and keyword alignment":"Meta tags or keyword coverage needs improvement" },
      { name:"Technical Health",  weight:25, score:tech,  impact: tech>=70?"positive":tech>=50?"neutral":"negative",  description: tech>=70 ?"Site structure and crawlability healthy":"Technical issues affecting crawlability" },
      { name:"Page Speed",        weight:20, score:speed, impact: speed>=70?"positive":speed>=50?"neutral":"negative", description: speed>=70?"Core Web Vitals pass threshold":"Page speed below competitive threshold" },
      { name:"Keyword Coverage",  weight:15, score:kwCov, impact: kwCov>=60?"positive":kwCov>=30?"neutral":"negative", description: kwCov>=60?"Target keywords well integrated":"Low keyword presence in key elements" },
      { name:"User Experience",   weight:10, score:user,  impact: user>=70?"positive":user>=50?"neutral":"negative",   description: user>=70 ?"Good heading structure and CTAs":"Content structure and navigation needs work" },
    ];

    const recommendations: string[] = [];
    if (speed < 70) recommendations.push("Improve page speed — target LCP < 2.5s, CLS < 0.1");
    if (seo   < 70) recommendations.push("Optimise title tags and meta descriptions with primary keywords");
    if (kwCov < 50) recommendations.push("Increase keyword density in H1, first paragraph, and subheadings");
    if (issues > 3) recommendations.push(`Fix ${issues} detected technical issues to remove ranking penalties`);
    if (tech  < 60) recommendations.push("Add JSON-LD structured data and resolve crawlability issues");
    if (!recommendations.length) recommendations.push("Maintain optimisation; focus next on link acquisition");

    const forecast = Array.from({ length: 4 }, (_, i) => {
      const drift = trajectory === "improving" ? -2 : trajectory === "declining" ? 3 : 0;
      return { week:`Week ${i+1}`, estimated_position: Math.max(1, mid + drift*(i+1)) };
    });

    return NextResponse.json({ ok:true, data:{ predicted_position_range:[minPos,maxPos], confidence, score:Math.round(adjusted), trajectory, key_factors:factors, recommendations, forecast } });
  } catch(e) {
    console.error("[rank-prediction]", e);
    return NextResponse.json({ ok:false, error:"Rank prediction failed" }, { status:500 });
  }
}
