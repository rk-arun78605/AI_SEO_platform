import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const TOPIC_GAPS: Record<string, string[]> = {
  "Healthcare / Medical": ["Patient testimonials and case studies","Medical credentials and author bios","FAQ schema for symptom/treatment queries","Condition-specific landing pages"],
  "Ecommerce":            ["Product comparison tables with competitor pricing","User-generated reviews and UGC integration","Category page optimisation with buying guides","Trust signals: guarantees, returns, badges"],
  "SaaS / Software":      ["Feature comparison vs. top competitors","Integration pages for each supported tool","ROI calculator or transparent pricing page","Customer success stories with measurable metrics"],
  "Services / Agency":    ["Service-specific pages with local-intent keywords","Portfolio with measurable project outcomes","Process/methodology page for credibility","Pricing page or 'starting from' anchor"],
};

function scoreTitle(title: string, kws: string[]): number {
  if (!title) return 0;
  const l = title.length;
  const lenS  = l >= 50 && l <= 60 ? 40 : l >= 40 && l <= 70 ? 25 : 10;
  const kwS   = kws.some(k => title.toLowerCase().includes(k.toLowerCase())) ? 40 : 0;
  const punctS = (title.includes("|") || title.includes("-") || title.includes(":")) ? 20 : 10;
  return Math.min(100, lenS + kwS + punctS);
}

function scoreDesc(desc: string, kws: string[]): number {
  if (!desc) return 0;
  const l    = desc.length;
  const lenS = l >= 150 && l <= 160 ? 40 : l >= 120 && l <= 180 ? 25 : 10;
  const kwS  = Math.min(40, kws.filter(k => desc.toLowerCase().includes(k.toLowerCase())).length * 15);
  const ctaS = /click|learn|discover|get|try|start|explore/i.test(desc) ? 20 : 0;
  return Math.min(100, lenS + kwS + ctaS);
}

export async function POST(request: NextRequest) {
  try {
    const b = await request.json();
    const title       = String(b.title       ?? "");
    const description = String(b.description ?? "");
    const h1          = String(b.h1          ?? "");
    const keywords    = Array.isArray(b.topKeywords) ? b.topKeywords as string[] : [];
    const topic       = String(b.primaryTopic ?? "General Business");

    const pk  = keywords[0] || topic;
    const sup = keywords.slice(1, 4);

    const titleScore = scoreTitle(title, keywords);
    const descScore  = scoreDesc(description, keywords);
    const h1Score    = h1 ? (keywords.some(k => h1.toLowerCase().includes(k.toLowerCase())) ? 80 : 50) : 0;
    const overall    = Math.round((titleScore + descScore + h1Score) / 3);

    const improved_title =
      !title     ? `${pk} — Expert Guide | ${topic}` :
      title.length > 60 ? title.slice(0, 57) + "..." :
      !title.toLowerCase().includes(pk.toLowerCase()) ? `${pk} | ${title}`.slice(0, 60) :
      title;

    const rawDesc = description || `Discover everything about ${pk}.`;
    const improved_description =
      rawDesc.length > 160 ? rawDesc.slice(0, 157) + "..." :
      rawDesc.length < 120 ? `${rawDesc} Learn more about ${sup[0] || pk} and get started today.`.slice(0, 160) :
      rawDesc;

    const improved_h1 =
      !h1 ? `${pk} — Complete Guide` :
      h1.toLowerCase().includes(pk.toLowerCase()) ? h1 :
      `${pk}: ${h1}`.slice(0, 70);

    const content_gaps = TOPIC_GAPS[topic] || [
      `Create a dedicated page targeting: ${pk}`,
      `Add FAQ section covering: ${sup.join(", ") || pk}`,
      "Build a topic cluster with 3–5 supporting articles",
      "Add internal links from high-traffic pages to this page",
    ];

    const schema_recommendations = [
      topic === "Ecommerce"   ? "Add Product + Review schema on category/product pages" : "Add Organization + WebSite schema on homepage",
      "Implement Breadcrumb schema for all inner pages",
      "Add FAQ schema to question-based content",
      topic === "Healthcare / Medical" ? "Add MedicalOrganization and Physician schema" : "Add HowTo schema for guide/tutorial content",
    ];

    const internal_linking = [
      `Link from homepage to your top ${pk} page`,
      "Add contextual links between related service/product pages",
      "Create a pillar page linking to all topic-cluster articles",
      "Ensure every page has ≥ 3 internal links from higher-authority pages",
    ];

    const readability_tips = [
      "Break content into sections with H2/H3 every 200–300 words",
      "Use bullet points and numbered lists for scannable content",
      "Keep sentences under 20 words and paragraphs under 4 lines",
      "Add a TL;DR summary at the top for long-form content",
    ];

    return NextResponse.json({ ok:true, data:{ improved_title, improved_description, improved_h1, content_gaps, schema_recommendations, internal_linking, readability_tips, score_breakdown:{ title_score:titleScore, description_score:descScore, h1_score:h1Score, overall_content_score:overall } } });
  } catch(e) {
    console.error("[content-studio]", e);
    return NextResponse.json({ ok:false, error:"Content studio analysis failed" }, { status:500 });
  }
}
