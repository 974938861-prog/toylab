"use client";

import type { CaseStep } from "@/lib/types";

interface SopStepsProps {
  steps: CaseStep[];
}

export default function SopSteps({ steps }: SopStepsProps) {
  if (steps.length === 0) return null;

  return (
    <section className="cd-section">
      <h2 className="cd-section-title">制作步骤</h2>
      <div>
        {steps.map((step) => (
          <div key={step.id} className="sop-step">
            <div className="sop-step-content">
              <div className="sop-step-title">{step.title}</div>
              {step.description && <div className="sop-step-desc">{step.description}</div>}
              {step.duration_minutes && (
                <div className="sop-step-duration">预计耗时：{step.duration_minutes} 分钟</div>
              )}
              {step.image_url && (
                <img
                  src={step.image_url}
                  alt={step.title}
                  style={{ marginTop: 12, maxWidth: "100%", borderRadius: 12 }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
