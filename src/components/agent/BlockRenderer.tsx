import React from 'react';
import { AgentBlock } from '../../agent/contracts';
import { MetricDisambiguationBlock } from './blocks/MetricDisambiguationBlock';
import { MetricAnswerBlock } from './blocks/MetricAnswerBlock';
import { ExecutionProgressBlock } from './blocks/ExecutionProgressBlock';
import { EvidenceBlock } from './blocks/EvidenceBlock';
import { FileBindingBlock } from './blocks/FileBindingBlock';
import { ToolExecutionBlock } from './blocks/ToolExecutionBlock';
import { AnalysisResultBlock } from './blocks/AnalysisResultBlock';
import { ArtifactBlock } from './blocks/ArtifactBlock';
import { SchedulePlanBlock } from './blocks/SchedulePlanBlock';
import { ScheduleCreatedBlock } from './blocks/ScheduleCreatedBlock';
import { ShareSelectionBlock } from './blocks/ShareSelectionBlock';
import { AssistantMessageBlock } from './blocks/AssistantMessageBlock';
import { ErrorNoticeBlock } from './blocks/ErrorNoticeBlock';

interface BlockRendererProps {
  block: AgentBlock;
  availableBlocks?: AgentBlock[];
  onSelectMetric?: (metricId: string) => void;
  onOpenMetricContext?: () => void;
  onFollowUpDiagnosis?: () => void;
  onOpenTrace?: () => void;
  onOpenReport?: (artifactId: string) => void;
  onConfirmSchedule?: () => void;
  onInitiateShare?: () => void;
  onCreateShare?: (blockIds: string[], blocksToShare?: AgentBlock[]) => Promise<any>;
  onOpenReadOnlyView?: () => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  availableBlocks,
  onSelectMetric,
  onOpenMetricContext,
  onFollowUpDiagnosis,
  onOpenTrace,
  onOpenReport,
  onConfirmSchedule,
  onInitiateShare,
  onCreateShare,
  onOpenReadOnlyView,
}) => {
  switch (block.type) {
    case 'metric_disambiguation':
      return (
        <MetricDisambiguationBlock
          payload={block.payload}
          onSelectMetric={onSelectMetric || (() => {})}
        />
      );

    case 'metric_answer':
      return (
        <MetricAnswerBlock
          payload={block.payload}
          onOpenMetricContext={onOpenMetricContext}
          onFollowUpDiagnosis={onFollowUpDiagnosis}
        />
      );

    case 'execution_progress':
      return <ExecutionProgressBlock payload={block.payload} />;

    case 'evidence_summary':
      return <EvidenceBlock payload={block.payload} />;

    case 'file_semantic_binding':
      return <FileBindingBlock payload={block.payload} />;

    case 'tool_execution':
      return (
        <ToolExecutionBlock
          payload={block.payload}
          onOpenTrace={onOpenTrace}
        />
      );

    case 'analysis_result':
      return <AnalysisResultBlock payload={block.payload} />;

    case 'artifact_summary':
      return (
        <ArtifactBlock
          payload={block.payload}
          onOpenReport={onOpenReport}
        />
      );

    case 'schedule_plan':
      return (
        <SchedulePlanBlock
          payload={block.payload}
          status={block.status}
          onConfirmSchedule={onConfirmSchedule || (() => {})}
        />
      );

    case 'schedule_created':
      return (
        <ScheduleCreatedBlock
          payload={block.payload}
          onInitiateShare={onInitiateShare}
        />
      );

    case 'share_selection':
      return (
        <ShareSelectionBlock
          availableBlocks={availableBlocks}
          onCreateShare={onCreateShare || (async () => ({}))}
          onOpenReadOnlyView={onOpenReadOnlyView}
        />
      );

    case 'assistant_message':
      return <AssistantMessageBlock text={block.payload?.text} />;

    case 'error_notice':
      return <ErrorNoticeBlock message={block.payload?.message} />;

    default:
      return null;
  }
};
