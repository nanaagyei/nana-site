import { ArticleDiagram } from "@/components/article/article-diagram";
import { DIVERGE_AT, rankTimelineSummary } from "./rank-timeline-data";
import { RankTimelineChart } from "./rank-timeline-chart";

export function RankTimeline() {
  const { rank2End, meanEnd, flatEnd } = rankTimelineSummary();

  return (
    <ArticleDiagram
      label="Figure 8"
      title="Allocated memory on four ranks of one job"
      description={`Illustrative data. Ranks 0, 1 and 3 stay near ${flatEnd.toFixed(1)} gigabytes. Rank 2 begins to climb around sample ${DIVERGE_AT} and ends near ${rank2End.toFixed(1)} gigabytes. The average across all four ranks ends near ${meanEnd.toFixed(1)} gigabytes, so the average shows a much smaller rise than rank 2 does. A table below lists the values.`}
      caption={
        <>
          <strong className="font-medium text-ink">Illustrative, not measured.</strong>{" "}
          With four ranks, one drifting rank moves the average by a quarter of its own change.
        </>
      }
    >
      <RankTimelineChart />
    </ArticleDiagram>
  );
}
