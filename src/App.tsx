import React, { useState, useEffect } from 'react';
import { PageState } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Composer } from './components/Composer';
import { ContextPanel } from './components/ContextPanel';
import { ReportModal } from './components/ReportModal';
import { ShareModal } from './components/ShareModal';
import { ShareSelectionModal } from './components/ShareSelectionModal';
import { PresenterControl } from './components/PresenterControl';
import { AgentThread } from './components/agent/AgentThread';
import { useAgentTask } from './agent/useAgentTask';
import { ShareArtifact } from './agent/contracts';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { safePushState } from './utils/safeBrowser';

// Keyframe legacy pages for presenter inspection
import { Page01Ask } from './components/pages/Page01Ask';
import { Page02Disambiguation } from './components/pages/Page02Disambiguation';
import { Page03Diagnosis } from './components/pages/Page03Diagnosis';
import { Page04FileAnalysis } from './components/pages/Page04FileAnalysis';
import { Page05ScheduleConfirm } from './components/pages/Page05ScheduleConfirm';
import { Page06ScheduleSuccess } from './components/pages/Page06ScheduleSuccess';
import { Page07ShareSelect } from './components/pages/Page07ShareSelect';
import { Page08ReadOnly } from './components/pages/Page08ReadOnly';

export default function App() {
  const demoMode = (import.meta as any).env?.VITE_DEMO_MODE === 'true';

  const [currentPage, setCurrentPage] = useState<PageState>('page01');
  const [viewMode, setViewMode] = useState<'continuous' | 'keyframes'>('continuous');
  const [showPresenterControl, setShowPresenterControl] = useState(demoMode);
  const [activeRightPanel, setActiveRightPanel] = useState<'metric' | 'python' | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isShareSelectModalOpen, setIsShareSelectModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareSelectedCount, setShareSelectedCount] = useState(4);
  const [customShareUrl, setCustomShareUrl] = useState<string | undefined>(undefined);
  const [activeReportDocument, setActiveReportDocument] = useState<any>(null);

  // Direct share link routing support (/share/:shareId)
  const [directShareId, setDirectShareId] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/share/')) {
      const id = window.location.pathname.replace('/share/', '').trim();
      return id.length > 0 ? id : null;
    }
    return null;
  });
  const [directShareArtifact, setDirectShareArtifact] = useState<ShareArtifact | null>(null);
  const [shareLoadError, setShareLoadError] = useState<string | null>(null);
  const [, setShareLoading] = useState<boolean>(false);

  // Real Agent Task Runtime Hook
  const {
    task,
    loading,
    activeTraceExecution,
    activeShareArtifact,
    activeMetricDefinition,
    sendMessage,
    stopGenerating,
    selectMetric,
    confirmSchedule,
    createShare,
    triggerDiagnosis,
    resetSession,
  } = useAgentTask();

  // Handle direct share URL lookup
  useEffect(() => {
    if (directShareId) {
      setShareLoading(true);
      fetch(`/api/v1/shares/${directShareId}`)
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || `分享链接不存在或已失效 (404 Not Found)`);
          }
          return res.json();
        })
        .then((data: ShareArtifact) => {
          setDirectShareArtifact(data);
          setCurrentPage('page08');
        })
        .catch((err: any) => {
          setShareLoadError(err.message || '分享链接不存在或已失效');
        })
        .finally(() => {
          setShareLoading(false);
        });
    }
  }, [directShareId]);

  // Flatten all task blocks
  const allTaskBlocks = task.turns.flatMap((t) => t.blocks);

  const pageSequence: PageState[] = [
    'page01',
    'page02',
    'page03',
    'page04',
    'page05',
    'page06',
    'page07',
    'page08',
  ];

  const handleNavigateNext = () => {
    const currentIndex = pageSequence.indexOf(currentPage);
    if (currentIndex < pageSequence.length - 1) {
      const nextPage = pageSequence[currentIndex + 1];
      setCurrentPage(nextPage);

      if (nextPage === 'page02') {
        setActiveRightPanel('metric');
      } else if (nextPage === 'page04') {
        setActiveRightPanel('python');
      } else {
        setActiveRightPanel(null);
      }
    }
  };

  const handleNavigateTo = (page: PageState) => {
    setCurrentPage(page);
    if (page === 'page02') {
      setActiveRightPanel('metric');
    } else if (page === 'page04') {
      setActiveRightPanel('python');
    } else {
      setActiveRightPanel(null);
    }
  };

  const isReadOnlyPage = currentPage === 'page08';

  // Handle Direct Share 404 Page
  if (directShareId && shareLoadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-slate-800">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-lg text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">分享产物不存在 (404)</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {shareLoadError}。该分享 ID 未在服务端注册或已过期，请检查分享链接是否正确。
          </p>
          <button
            onClick={() => {
              safePushState('/');
              setDirectShareId(null);
              setShareLoadError(null);
              setCurrentPage('page01');
            }}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回 Semovix AI 工作台</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Presenter Keyframe Control Bar - only in Demo Mode */}
      {demoMode && showPresenterControl && (
        <PresenterControl
          currentPage={currentPage}
          onNavigate={(page) => {
            setViewMode('keyframes');
            handleNavigateTo(page);
          }}
          onClose={() => setShowPresenterControl(false)}
        />
      )}

      {/* Main Unified Header */}
      <Header
        task={task}
        demoMode={demoMode}
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page === 'page01') {
            resetSession();
          }
          handleNavigateTo(page);
        }}
        onShare={() => {
          setIsShareSelectModalOpen(true);
        }}
        showPresenterControl={showPresenterControl}
        setShowPresenterControl={setShowPresenterControl}
        activeRightPanel={activeRightPanel}
        toggleRightPanel={(panel) => setActiveRightPanel(panel)}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* App Main Body Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Sidebar (Hidden on Page 08 for clean read-only presentation) */}
        {!isReadOnlyPage && (
          <Sidebar
            currentPage={currentPage}
            onNavigate={(page) => {
              if (page === 'page01') {
                resetSession();
              }
              handleNavigateTo(page);
            }}
          />
        )}

        {/* Central Workspace Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50/70 overflow-hidden relative">
          {viewMode === 'continuous' && !isReadOnlyPage && currentPage !== 'page07' ? (
            <div className="flex-1 flex flex-col min-h-0">
              <AgentThread
                task={task}
                turns={task.turns}
                loading={loading}
                onSelectMetric={(metricId) => {
                  selectMetric(metricId);
                  if (demoMode) setActiveRightPanel('metric');
                }}
                onOpenMetricContext={() => setActiveRightPanel('metric')}
                onFollowUpDiagnosis={() =>
                  triggerDiagnosis('为什么按期办结率环比下降了？请做多维归因分析。')
                }
                onOpenTrace={() => setActiveRightPanel('python')}
                onOpenReport={(artifactId) => {
                  if (artifactId) {
                    fetch(`/api/v1/artifacts/${artifactId}`)
                      .then((r) => (r.ok ? r.json() : null))
                      .then((doc) => {
                        if (doc) setActiveReportDocument(doc);
                        setIsReportModalOpen(true);
                      })
                      .catch(() => {
                        setIsReportModalOpen(true);
                      });
                  } else {
                    setIsReportModalOpen(true);
                  }
                }}
                onConfirmSchedule={() => confirmSchedule()}
                onInitiateShare={() => {
                  setIsShareSelectModalOpen(true);
                }}
                onCreateShare={async (blockIds, blocksToShare) => {
                  const share = await createShare(blockIds, blocksToShare);
                  if (share?.url) {
                    setCustomShareUrl(`${window.location.origin}${share.url}`);
                  }
                  return share;
                }}
                onOpenReadOnlyView={() => handleNavigateTo('page08')}
                onQuickPrompt={(prompt, hasFile) => {
                  if (hasFile) {
                    const sampleCsv =
                      'case_id,street_code,appeal_category,is_overdue,duration_days\n1001,SH01,物业管理,1,4.2\n1002,SH02,劳动保障,1,3.8';
                    const blob = new Blob([sampleCsv], { type: 'text/csv' });
                    const file = new File([blob], 'focus_case_list_2026W32.csv', {
                      type: 'text/csv',
                    });
                    sendMessage(prompt, [file]);
                  } else {
                    sendMessage(prompt);
                  }
                }}
              />

              {/* Bottom Composer */}
              <Composer
                task={task}
                loading={loading}
                demoMode={demoMode}
                onSend={async (text, files) => {
                  await sendMessage(text, files);
                }}
                onStop={stopGenerating}
              />
            </div>
          ) : (
            <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col overflow-y-auto">
              {currentPage === 'page01' && (
                <Page01Ask onNavigateNext={handleNavigateNext} />
              )}

              {currentPage === 'page02' && (
                <Page02Disambiguation
                  onNavigateNext={handleNavigateNext}
                  onOpenMetricPanel={() => setActiveRightPanel('metric')}
                />
              )}

              {currentPage === 'page03' && (
                <Page03Diagnosis
                  onNavigateNext={handleNavigateNext}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                />
              )}

              {currentPage === 'page04' && (
                <Page04FileAnalysis
                  onNavigateNext={handleNavigateNext}
                  onOpenPythonPanel={() => setActiveRightPanel('python')}
                />
              )}

              {currentPage === 'page05' && (
                <Page05ScheduleConfirm onNavigateNext={handleNavigateNext} />
              )}

              {currentPage === 'page06' && (
                <Page06ScheduleSuccess onNavigateNext={handleNavigateNext} />
              )}

              {currentPage === 'page07' && (
                <Page07ShareSelect
                  availableBlocks={allTaskBlocks}
                  onGenerateShareLink={async (count, selectedBlockIds) => {
                    setShareSelectedCount(count);
                    if (selectedBlockIds && selectedBlockIds.length > 0) {
                      const share = await createShare(selectedBlockIds);
                      if (share?.url) {
                        setCustomShareUrl(`${window.location.origin}${share.url}`);
                      }
                    }
                    setIsShareModalOpen(true);
                  }}
                  onCancel={() => handleNavigateTo('page06')}
                />
              )}

              {currentPage === 'page08' && (
                <Page08ReadOnly
                  shareArtifact={directShareArtifact || activeShareArtifact || task.context?.shareArtifact}
                  taskBlocks={allTaskBlocks}
                  onOpenReportModal={(artifactId) => {
                    if (artifactId) {
                      fetch(`/api/v1/artifacts/${artifactId}`)
                        .then((r) => (r.ok ? r.json() : null))
                        .then((doc) => {
                          if (doc) setActiveReportDocument(doc);
                          setIsReportModalOpen(true);
                        })
                        .catch(() => {
                          setIsReportModalOpen(true);
                        });
                    } else {
                      setIsReportModalOpen(true);
                    }
                  }}
                  onReturnToWorkbench={() => {
                    if (directShareId) {
                      safePushState('/');
                      setDirectShareId(null);
                    }
                    handleNavigateTo('page06');
                  }}
                />
              )}
            </div>
          )}
        </main>

        {/* Right Dynamic Context Panel */}
        {!isReadOnlyPage && (
          <ContextPanel
            type={activeRightPanel}
            onClose={() => setActiveRightPanel(null)}
            dynamicExecution={activeTraceExecution}
            metricDefinition={task.context?.metricDefinition || activeMetricDefinition}
          />
        )}
      </div>

      {/* HTML Analysis Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportDocument={activeReportDocument || task.context?.latestReportDocument}
        onShare={() => {
          setIsReportModalOpen(false);
          setIsShareSelectModalOpen(true);
        }}
      />

      {/* Share Content Selection Modal */}
      <ShareSelectionModal
        isOpen={isShareSelectModalOpen}
        onClose={() => setIsShareSelectModalOpen(false)}
        availableBlocks={allTaskBlocks}
        onCreateShare={async (blockIds, blocksToShare) => {
          const share = await createShare(blockIds, blocksToShare);
          if (share?.url) {
            setCustomShareUrl(`${window.location.origin}${share.url}`);
          }
          return share;
        }}
        onShareCreated={(shareUrl, selectedCount) => {
          setCustomShareUrl(shareUrl);
          setShareSelectedCount(selectedCount);
          setIsShareModalOpen(true);
        }}
      />

      {/* Share Link Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        selectedCount={shareSelectedCount}
        shareUrl={customShareUrl || task.context?.shareUrl}
        onOpenReadOnlyView={() => {
          setIsShareModalOpen(false);
          handleNavigateTo('page08');
        }}
      />
    </div>
  );
}
