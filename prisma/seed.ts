import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.summary.deleteMany();
  await prisma.transcript.deleteMany();
  await prisma.call.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  const password = hashSync("demo123", 10);

  // Create Teams
  const eastTeam = await prisma.team.create({
    data: { name: "East Region", region: "East" },
  });
  const northTeam = await prisma.team.create({
    data: { name: "North Region", region: "North" },
  });
  const westTeam = await prisma.team.create({
    data: { name: "West Region", region: "West" },
  });

  // Create Users
  const admin = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya@ushamartin.com",
      password,
      role: "admin",
      teamId: northTeam.id,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Rajesh Kumar",
      email: "rajesh@ushamartin.com",
      password,
      role: "manager",
      teamId: eastTeam.id,
    },
  });

  const rep1 = await prisma.user.create({
    data: {
      name: "Amit Patel",
      email: "amit@ushamartin.com",
      password,
      role: "rep",
      teamId: eastTeam.id,
    },
  });

  const rep2 = await prisma.user.create({
    data: {
      name: "Sneha Reddy",
      email: "sneha@ushamartin.com",
      password,
      role: "rep",
      teamId: northTeam.id,
    },
  });

  const rep3 = await prisma.user.create({
    data: {
      name: "Vikram Singh",
      email: "vikram@ushamartin.com",
      password,
      role: "rep",
      teamId: westTeam.id,
    },
  });

  // Create Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: { name: "Suresh Mehta", company: "Tata Projects", location: "Mumbai", phone: "+91-9876543210" },
    }),
    prisma.customer.create({
      data: { name: "Anil Gupta", company: "L&T Construction", location: "Chennai", phone: "+91-9876543211" },
    }),
    prisma.customer.create({
      data: { name: "Ramesh Agarwal", company: "Jindal Steel", location: "Delhi", phone: "+91-9876543212" },
    }),
    prisma.customer.create({
      data: { name: "Deepak Joshi", company: "Ambuja Cements", location: "Ahmedabad", phone: "+91-9876543213" },
    }),
    prisma.customer.create({
      data: { name: "Kiran Desai", company: "Godrej Properties", location: "Pune", phone: "+91-9876543214" },
    }),
    prisma.customer.create({
      data: { name: "Manoj Tiwari", company: "Adani Infra", location: "Gandhinagar", phone: "+91-9876543215" },
    }),
    prisma.customer.create({
      data: { name: "Sanjay Verma", company: "UltraTech Cement", location: "Kolkata", phone: "+91-9876543216" },
    }),
    prisma.customer.create({
      data: { name: "Prakash Rao", company: "JSW Steel", location: "Bangalore", phone: "+91-9876543217" },
    }),
  ]);

  const [tata, lnt, jindal, ambuja, godrej, adani, ultratech, jsw] = customers;

  // Helper to create dates spread over last 30 days
  const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

  // Seed Calls with transcripts and summaries
  const callsData = [
    // Orders (5)
    {
      userId: rep1.id, customerId: tata.id, status: "complete", duration: 847,
      outcomeLabel: "Order", outcomeConfidence: 0.95,
      createdAt: daysAgo(2),
      transcript: "Amit: Good morning Suresh ji, thank you for taking the time to meet. How is the Navi Mumbai project progressing?\n\nSuresh: Very well Amit. We've completed the foundation work and now need wire ropes for the crane installations. The structural steel phase is starting next month.\n\nAmit: That's great to hear. Based on your project specs, I'd recommend our 6x36 IWRC wire ropes for the tower cranes. They offer excellent fatigue resistance for high-cycle operations.\n\nSuresh: Yes, we've used those before on the Pune project. Very reliable. We need 12 units of 28mm diameter, 200 meters each.\n\nAmit: Absolutely. At the current rate, that would be approximately ₹18.5 lakhs for the full order. We can deliver in 2 weeks.\n\nSuresh: That works with our timeline. Let's finalize this. I'll send the PO by end of week.\n\nAmit: Excellent. I'll prepare the proforma invoice today.",
      summary: "Tata Projects placing order for 12 units of 6x36 IWRC wire ropes (28mm, 200m each) for Navi Mumbai crane installations. Order value approximately ₹18.5 lakhs with 2-week delivery timeline. PO expected by end of week.",
      extractedFields: JSON.stringify({ orderValue: "₹18.5 lakhs", products: "6x36 IWRC wire ropes 28mm", quantity: "12 units x 200m", deliveryTimeline: "2 weeks", project: "Navi Mumbai" }),
    },
    {
      userId: rep2.id, customerId: jindal.id, status: "complete", duration: 623,
      outcomeLabel: "Order", outcomeConfidence: 0.92,
      createdAt: daysAgo(5),
      transcript: "Sneha: Hello Ramesh ji, hope you're doing well. I wanted to follow up on the conveyor belt wire ropes we discussed last week.\n\nRamesh: Yes Sneha, I've reviewed the specifications with our engineering team. We want to go ahead with the order. We need the ropes for our Angul plant expansion.\n\nSneha: Wonderful. So that's 8 units of the mining-grade wire ropes, correct?\n\nRamesh: Yes, 8 units. Also add 4 units of the elevator ropes for the new ore handling system.\n\nSneha: Got it. The total would be around ₹12.8 lakhs. Shall I process the order?\n\nRamesh: Please do. Priority delivery if possible — the plant commissioning is in 6 weeks.",
      summary: "Jindal Steel confirming order for Angul plant expansion: 8 mining-grade conveyor wire ropes + 4 elevator ropes for ore handling. Total ₹12.8 lakhs. Priority delivery requested — plant commissioning in 6 weeks.",
      extractedFields: JSON.stringify({ orderValue: "₹12.8 lakhs", products: "Mining-grade wire ropes + elevator ropes", quantity: "8 + 4 units", deliveryTimeline: "Priority (6-week deadline)", project: "Angul plant expansion" }),
    },
    {
      userId: rep1.id, customerId: godrej.id, status: "complete", duration: 512,
      outcomeLabel: "Order", outcomeConfidence: 0.88,
      createdAt: daysAgo(8),
      transcript: "Amit: Kiran ji, good afternoon. I understand you have a new residential project in Vikhroli?\n\nKiran: Yes Amit, Godrej Horizon. 45-floor tower. We need construction elevator ropes and some specialty ropes for the façade work.\n\nAmit: For 45 floors, I'd recommend our high-strength elevator ropes — they're rated for buildings up to 60 floors. For façade work, we have excellent galvanized strand ropes.\n\nKiran: Sounds good. Send me a detailed quote for 6 elevator rope sets and 20 units of the façade ropes.\n\nAmit: I'll have that to you by tomorrow morning. Estimated value will be around ₹8.2 lakhs.\n\nKiran: If the numbers work, we'll place the order this week.",
      summary: "Godrej Properties requesting quote for Godrej Horizon project (45-floor tower, Vikhroli): 6 elevator rope sets + 20 façade galvanized strand ropes. Estimated ₹8.2 lakhs. High likelihood of conversion this week.",
      extractedFields: JSON.stringify({ orderValue: "₹8.2 lakhs (estimated)", products: "Elevator ropes + galvanized strand ropes", quantity: "6 + 20 units", project: "Godrej Horizon, Vikhroli" }),
    },
    {
      userId: rep3.id, customerId: adani.id, status: "complete", duration: 934,
      outcomeLabel: "Order", outcomeConfidence: 0.97,
      createdAt: daysAgo(12),
      transcript: "Vikram: Manoj ji, thank you for the meeting today. I have the revised quote ready for the Mundra port expansion.\n\nManoj: Good. We've finalized the scope — the port needs crane ropes for 3 new ship-to-shore cranes and 5 RTG cranes.\n\nVikram: For the STS cranes, I recommend our compacted strand ropes, and for RTGs, our standard 6x25 construction. Total comes to ₹45.3 lakhs.\n\nManoj: That's within our budget. I'm authorizing the PO today. Delivery must be in 4 batches over 3 months.\n\nVikram: We can absolutely accommodate that schedule. First batch ready in 3 weeks.\n\nManoj: Let's do it. Send the documentation to procurement.",
      summary: "Major order from Adani Infra for Mundra port expansion: crane ropes for 3 STS cranes + 5 RTG cranes. Order value ₹45.3 lakhs. PO authorized same day. Delivery in 4 batches over 3 months, first batch in 3 weeks.",
      extractedFields: JSON.stringify({ orderValue: "₹45.3 lakhs", products: "Compacted strand + 6x25 crane ropes", quantity: "3 STS + 5 RTG crane sets", deliveryTimeline: "4 batches over 3 months", project: "Mundra port expansion" }),
    },
    {
      userId: rep2.id, customerId: ultratech.id, status: "complete", duration: 445,
      outcomeLabel: "Order", outcomeConfidence: 0.85,
      createdAt: daysAgo(15),
      transcript: "Sneha: Sanjay ji, I'm following up on the kiln wire rope replacement at your Durgapur plant.\n\nSanjay: Yes, we need to replace 4 sets urgently. The current ones have reached end of life.\n\nSneha: I have the specifications from your maintenance team. 4 sets of kiln wire ropes, 32mm diameter. Total is ₹6.4 lakhs.\n\nSanjay: Approved. Rush this please — any downtime on the kiln costs us heavily.\n\nSneha: Understood. I'll mark this as priority. We can ship within 5 business days.\n\nSanjay: Perfect. Send the invoice.",
      summary: "Urgent replacement order from UltraTech Cement: 4 sets of kiln wire ropes (32mm) for Durgapur plant. Value ₹6.4 lakhs. Rush delivery in 5 business days due to risk of kiln downtime.",
      extractedFields: JSON.stringify({ orderValue: "₹6.4 lakhs", products: "Kiln wire ropes 32mm", quantity: "4 sets", deliveryTimeline: "5 business days (rush)", project: "Durgapur plant maintenance" }),
    },
    // Complaints (4)
    {
      userId: rep1.id, customerId: lnt.id, status: "complete", duration: 1023,
      outcomeLabel: "Complaint", outcomeConfidence: 0.94, complaintSeverity: "high",
      createdAt: daysAgo(1),
      transcript: "Amit: Anil ji, thank you for meeting on short notice. I understand there's been an issue?\n\nAnil: Amit, I'm very concerned. The wire ropes delivered last month for our Chennai Metro project are showing premature wear. Our engineers found visible strand deterioration after just 3 weeks of operation.\n\nAmit: That's very concerning. Can you share the specific batch numbers and which ropes are affected?\n\nAnil: All 6 units from batch UM-2024-3847. The outer strands are fraying at the sheave contact points. We had to stop 2 cranes for safety.\n\nAmit: I sincerely apologize for this. I'll escalate immediately to our quality team. We should send an inspection team within 48 hours.\n\nAnil: Please do. We need replacement ropes and a root cause analysis. This is affecting our project timeline.\n\nAmit: Absolutely. I'll arrange replacements on priority and our technical team will be on site by Thursday.",
      summary: "URGENT: L&T Construction reporting premature wire rope failure on Chennai Metro project. Batch UM-2024-3847 — all 6 units showing strand deterioration after 3 weeks. 2 cranes stopped for safety. Replacement ropes + on-site inspection within 48 hours promised. Root cause analysis needed.",
      extractedFields: JSON.stringify({ issue: "Premature strand deterioration", batchNumber: "UM-2024-3847", unitsAffected: "6 units", project: "Chennai Metro", impact: "2 cranes stopped", resolution: "Replacement + inspection within 48 hours" }),
    },
    {
      userId: rep3.id, customerId: jsw.id, status: "complete", duration: 678,
      outcomeLabel: "Complaint", outcomeConfidence: 0.89, complaintSeverity: "medium",
      createdAt: daysAgo(7),
      transcript: "Vikram: Prakash ji, good morning. You mentioned some concerns about the recent delivery?\n\nPrakash: Yes Vikram. The last shipment of crane ropes for our Vijayanagar plant had a documentation issue. The test certificates don't match the actual rope specifications. The diameter readings on the cert say 24mm but we ordered and received 22mm.\n\nVikram: I see — that sounds like a paperwork error. Were the actual ropes the correct 22mm specification?\n\nPrakash: Yes, the ropes themselves seem fine. But our quality department rejected the lot because the certs don't match. We can't install them without proper documentation.\n\nVikram: Completely understandable. I'll get corrected certificates issued today and courier them to you.\n\nPrakash: Please expedite. We have an installation scheduled for next week.",
      summary: "JSW Steel reporting documentation mismatch: test certificates show 24mm but ropes are 22mm (correct spec). Quality department rejected lot pending correct documentation. Corrected certificates to be issued and couriered same day. Installation deadline next week.",
      extractedFields: JSON.stringify({ issue: "Test certificate specification mismatch", plant: "Vijayanagar", impact: "Lot rejected by QA", resolution: "Corrected certificates same day" }),
    },
    {
      userId: rep2.id, customerId: ambuja.id, status: "complete", duration: 789,
      outcomeLabel: "Complaint", outcomeConfidence: 0.91, complaintSeverity: "critical",
      createdAt: daysAgo(10),
      transcript: "Sneha: Deepak ji, I came as soon as I heard. Can you walk me through what happened?\n\nDeepak: Sneha, this is serious. Yesterday during routine operations, one of the crane wire ropes snapped at the Ambujanagar plant. Fortunately, the load was near ground level and no one was injured.\n\nSneha: Thank God no one was hurt. Do you know which rope failed?\n\nDeepak: It was from the batch delivered 4 months ago. Our safety team has quarantined all ropes from the same batch. We need an immediate technical investigation.\n\nSneha: Absolutely. I'm dispatching our chief engineer today. We'll do a full metallurgical analysis. Meanwhile, please continue keeping those ropes out of service.\n\nDeepak: We expect a comprehensive report within 1 week, and full replacement of all ropes from that batch at no cost.\n\nSneha: That's completely fair. I'll personally ensure this is our top priority.",
      summary: "CRITICAL: Wire rope snapped during operations at Ambuja Cements' Ambujanagar plant. No injuries reported. All ropes from same batch quarantined. Chief engineer dispatched for immediate investigation. Full metallurgical analysis and comprehensive report within 1 week. Batch replacement at no cost committed.",
      extractedFields: JSON.stringify({ issue: "Wire rope snapped during operation", severity: "Critical - safety incident", plant: "Ambujanagar", injuries: "None", resolution: "Investigation + full batch replacement at no cost", deadline: "Report within 1 week" }),
    },
    {
      userId: rep1.id, customerId: ultratech.id, status: "complete", duration: 445,
      outcomeLabel: "Complaint", outcomeConfidence: 0.82, complaintSeverity: "low",
      createdAt: daysAgo(18),
      transcript: "Amit: Sanjay ji, how are things at the Durgapur plant?\n\nSanjay: Mostly fine Amit, but I wanted to flag something. The last delivery was 3 days late, and we had to reschedule our maintenance window.\n\nAmit: I apologize for the delay. Was this the kiln rope order from last month?\n\nSanjay: Yes. It's not critical — we managed — but punctuality matters for our planned shutdowns. We schedule these weeks in advance.\n\nAmit: Absolutely, I understand. I'll look into the cause and make sure it doesn't happen again. Would you like me to set up delivery alerts so your team gets real-time tracking?\n\nSanjay: That would help. Just keep it tight next time.",
      summary: "UltraTech Cement flagging 3-day delivery delay on kiln rope order to Durgapur plant. Caused maintenance window rescheduling. Low severity — managed operationally. Offered delivery tracking alerts as preventive measure.",
      extractedFields: JSON.stringify({ issue: "3-day delivery delay", impact: "Maintenance window rescheduled", plant: "Durgapur", resolution: "Delivery tracking alerts offered" }),
    },
    // Normal Visits (8)
    {
      userId: rep1.id, customerId: tata.id, status: "complete", duration: 567,
      outcomeLabel: "Normal Visit", outcomeConfidence: 0.93,
      createdAt: daysAgo(3),
      transcript: "Amit: Suresh ji, just a quick check-in on how the ropes are performing on site.\n\nSuresh: All good Amit. The installation went smoothly last week. Your technical team did a great job with the commissioning support.\n\nAmit: Glad to hear. Any upcoming requirements I should know about?\n\nSuresh: Phase 2 of the project starts in Q2. We might need additional ropes for the passenger elevators. I'll share specs when ready.\n\nAmit: Perfect. I'll keep a slot in our production schedule. Thanks for the update.",
      summary: "Routine check-in with Tata Projects. Wire rope installation and commissioning went well. Phase 2 starting Q2 may require passenger elevator ropes — specs to follow.",
      extractedFields: JSON.stringify({ status: "Installation successful", nextSteps: "Phase 2 elevator ropes in Q2", sentiment: "Positive" }),
    },
    {
      userId: rep2.id, customerId: jindal.id, status: "complete", duration: 412,
      outcomeLabel: "Normal Visit", outcomeConfidence: 0.96,
      createdAt: daysAgo(4),
      transcript: "Sneha: Ramesh ji, how is the Angul plant expansion coming along?\n\nRamesh: On schedule. The ropes haven't arrived yet but we're not worried — still 4 weeks until we need them.\n\nSneha: Good. I checked with logistics and your shipment is on track for delivery next week.\n\nRamesh: Excellent. By the way, we're also looking at upgrading the hoist ropes in our existing mill. Can you send someone for a technical assessment?\n\nSneha: Of course. I'll schedule our application engineer for a site visit next week.\n\nRamesh: That works. Thank you Sneha.",
      summary: "Regular update with Jindal Steel. Angul order on track for delivery next week. New opportunity: hoist rope upgrade at existing mill — technical assessment visit scheduled.",
      extractedFields: JSON.stringify({ deliveryStatus: "On track for next week", newOpportunity: "Hoist rope upgrade at existing mill", nextSteps: "Application engineer site visit" }),
    },
    {
      userId: rep3.id, customerId: adani.id, status: "complete", duration: 334,
      outcomeLabel: "Normal Visit", outcomeConfidence: 0.91,
      createdAt: daysAgo(6),
      transcript: "Vikram: Manoj ji, just wanted to confirm receipt of the first batch for Mundra.\n\nManoj: Received yesterday. Quality team is inspecting now. Should be cleared by tomorrow.\n\nVikram: Great. Second batch is scheduled for next month per our agreement.\n\nManoj: All good. Keep me posted on the schedule.\n\nVikram: Will do. Have a good day.",
      summary: "Quick check-in on Mundra port order. First batch received and under QA inspection. Second batch scheduled per plan for next month.",
      extractedFields: JSON.stringify({ deliveryStatus: "Batch 1 received, under QA", nextBatch: "Next month", status: "On track" }),
    },
    {
      userId: rep1.id, customerId: ambuja.id, status: "complete", duration: 623,
      outcomeLabel: "Normal Visit", outcomeConfidence: 0.87,
      createdAt: daysAgo(20),
      transcript: "Amit: Deepak ji, I'm here for the quarterly business review. How has the last quarter been?\n\nDeepak: Overall satisfactory Amit. Consumption has been steady. We're maintaining about the same volume as last quarter.\n\nAmit: Good to hear. Are there any new projects or expansions planned?\n\nDeepak: We're evaluating a new grinding unit. If approved, it'll need a full set of material handling ropes. Decision expected by end of Q1.\n\nAmit: I'll keep that on my radar. Anything else I can help with?\n\nDeepak: Not at the moment. Keep the service levels up and we're happy.",
      summary: "Quarterly business review with Ambuja Cements. Steady consumption, no issues. Potential new grinding unit project — decision by end of Q1. Maintain current service levels.",
      extractedFields: JSON.stringify({ businessStatus: "Steady consumption", pipeline: "New grinding unit (decision end Q1)", sentiment: "Satisfied" }),
    },
    {
      userId: rep2.id, customerId: godrej.id, status: "complete", duration: 478,
      outcomeLabel: "Normal Visit", outcomeConfidence: 0.94,
      createdAt: daysAgo(11),
      transcript: "Sneha: Kiran ji, I'm visiting to understand your upcoming project pipeline.\n\nKiran: Good timing Sneha. We have 3 new residential projects launching this year. Each will need construction elevator ropes and crane ropes.\n\nSneha: That's exciting. Can you share the project names and timelines?\n\nKiran: Godrej Zenith in Kanjurmarg — starts next month. Godrej Riviera in Kalyan — starts Q3. And Godrej Exquisite Phase 2 in Thane — starts Q4.\n\nSneha: I'll prepare individual proposals for each. Shall I coordinate with your project managers directly?\n\nKiran: Yes, I'll share their contacts.",
      summary: "Pipeline mapping with Godrej Properties. 3 new residential projects this year: Zenith (Kanjurmarg, next month), Riviera (Kalyan, Q3), Exquisite Phase 2 (Thane, Q4). Individual proposals to be prepared. Direct project manager contacts to be shared.",
      extractedFields: JSON.stringify({ pipeline: "3 projects: Zenith, Riviera, Exquisite Phase 2", timeline: "Next month, Q3, Q4", nextSteps: "Individual proposals + PM coordination" }),
    },
    {
      userId: rep3.id, customerId: jsw.id, status: "complete", duration: 389,
      outcomeLabel: "Normal Visit", outcomeConfidence: 0.92,
      createdAt: daysAgo(14),
      transcript: "Vikram: Prakash ji, following up on the corrected certificates. Did everything reach you?\n\nPrakash: Yes Vikram, received them yesterday. QA has cleared the lot and installation is scheduled for this weekend.\n\nVikram: Excellent. Glad we could resolve that quickly.\n\nPrakash: It was handled well. One thing — we'll need to start planning the annual rope replacement program for next financial year.\n\nVikram: I'll prepare a comprehensive proposal covering all your plants. When would you like to review it?\n\nPrakash: Send it by month end. We'll discuss in April.",
      summary: "Follow-up on resolved certificate issue with JSW Steel. Installation proceeding this weekend. New opportunity: annual rope replacement program for next FY — proposal needed by month end for April discussion.",
      extractedFields: JSON.stringify({ certificateIssue: "Resolved", installation: "This weekend", newOpportunity: "Annual replacement program", deadline: "Proposal by month end" }),
    },
    {
      userId: rep1.id, customerId: lnt.id, status: "complete", duration: 534,
      outcomeLabel: "Normal Visit", outcomeConfidence: 0.88,
      createdAt: daysAgo(16),
      transcript: "Amit: Anil ji, I wanted to introduce our new product line for metro rail applications.\n\nAnil: Go ahead Amit, we're always interested in new technology.\n\nAmit: We've launched a new range of galvanized ropes specifically designed for metro rail OHE systems. Higher corrosion resistance and longer service life.\n\nAnil: Interesting. We have 3 metro projects currently. Send me the technical brochure and pricing.\n\nAmit: Will do. I can also arrange a presentation with our technical director if you'd like.\n\nAnil: Let me review the brochure first. If it looks promising, we'll set up the presentation.",
      summary: "Product introduction meeting with L&T Construction. Presented new galvanized rope line for metro rail OHE systems. L&T has 3 active metro projects. Technical brochure + pricing to be sent. Potential presentation with technical director if interest confirmed.",
      extractedFields: JSON.stringify({ productPresented: "Metro rail OHE galvanized ropes", opportunity: "3 active metro projects", nextSteps: "Send brochure + pricing" }),
    },
    {
      userId: rep3.id, customerId: tata.id, status: "complete", duration: 298,
      outcomeLabel: "Normal Visit", outcomeConfidence: 0.95,
      createdAt: daysAgo(22),
      transcript: "Vikram: Suresh ji, I'm visiting on behalf of the team to discuss the safety audit requirements.\n\nSuresh: Thanks for coming Vikram. Tata Projects now requires annual safety certifications for all wire ropes on active projects.\n\nVikram: We can definitely support that. We offer rope inspection services with certified reports.\n\nSuresh: Good. Let's set up a schedule for all our active sites. There are 4 projects using Usha Martin ropes currently.\n\nVikram: I'll coordinate with each project manager and set up the inspection calendar.\n\nSuresh: Perfect. This is now a compliance requirement, so please prioritize it.",
      summary: "Safety audit discussion with Tata Projects. New compliance requirement: annual safety certifications for all wire ropes. 4 active projects need inspection services. Inspection calendar to be coordinated with project managers. Compliance-driven priority.",
      extractedFields: JSON.stringify({ requirement: "Annual safety certifications", sites: "4 active projects", nextSteps: "Set up inspection calendar", priority: "Compliance requirement" }),
    },
  ];

  for (const data of callsData) {
    const call = await prisma.call.create({
      data: {
        userId: data.userId,
        customerId: data.customerId,
        status: data.status,
        duration: data.duration,
        outcomeLabel: data.outcomeLabel,
        outcomeConfidence: data.outcomeConfidence,
        complaintSeverity: data.complaintSeverity || null,
        createdAt: data.createdAt,
        updatedAt: data.createdAt,
      },
    });

    await prisma.transcript.create({
      data: {
        callId: call.id,
        text: data.transcript,
      },
    });

    await prisma.summary.create({
      data: {
        callId: call.id,
        summaryText: data.summary,
        extractedFields: data.extractedFields,
      },
    });
  }

  console.log("Seed completed successfully!");
  console.log("Users created: admin (priya), manager (rajesh), reps (amit, sneha, vikram)");
  console.log("Password for all users: demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
