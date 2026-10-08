"use client";

import ThreatFeed from "../components/ThreatFeed";
import PageHeader from "../components/PageHeader";

export default function ThreatsPage() {
  return (
    <div>
      <PageHeader
        title="Threats"
        subtitle="Rogue devices, known CVEs and unencrypted services found in the latest scans."
      />
      <ThreatFeed />
    </div>
  );
}
