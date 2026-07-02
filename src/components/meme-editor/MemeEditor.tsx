import { useState } from "react";
import { useMemeEditor } from "./use-meme-editor";
import { EditorCanvas } from "./EditorCanvas";
import { EditorRail } from "./EditorRail";
import { EditorSidebar } from "./EditorSidebar";
import { EditorTopBar } from "./EditorTopBar";
import { ShareDialog } from "./ShareDialog";
import { useMemeEditorShare } from "./use-meme-editor-share";

export function MemeEditor() {
  const editor = useMemeEditor();
  const { state, refs, actions } = editor;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const share = useMemeEditorShare({
    canvasRef: refs.canvasRef,
    selectedId: state.selectedId,
    setSelectedId: actions.setSelectedId,
    docName: state.docName,
    format: state.format,
    canvasBg: state.canvasBg,
    videoSrc: state.videoSrc,
    videoStart: state.videoStart,
    videoEnd: state.videoEnd,
  });
  const pageLocked = Boolean(state.videoSrc || state.pageImageSrc);
  const lockLabel = state.videoSrc ? "Vidéo de page" : state.pageImageSrc ? "Image de page" : undefined;
  const handleApplyModel = (model: Parameters<typeof actions.applyModel>[0]) => {
    setSidebarOpen(false);
    void actions.applyModel(model);
  };
  const handleApplyMeme = (...args: Parameters<typeof actions.applyDirectorMeme>) => {
    setSidebarOpen(false);
    void actions.applyDirectorMeme(...args);
  };

  return (
    <div className="flex h-dvh w-full min-w-0 flex-col overflow-hidden bg-app-bg">
      <EditorTopBar
        docName={state.docName}
        onDocNameChange={actions.setDocName}
        format={state.format}
        onFormatChange={actions.setFormat}
        zoom={state.zoom}
        onZoomChange={actions.setZoom}
        onUndo={actions.undo}
        onRedo={actions.redo}
        onExport={actions.handleExport}
        onShare={() => setShareOpen(true)}
        exportLabel={state.isExportingVideo ? `Export ${Math.round(state.exportProgress)}%` : state.videoSrc ? "Exporter vidéo" : "Télécharger"}
        exportDisabled={state.isExportingVideo}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((value) => !value)}
        formatLocked={pageLocked}
        formatLockLabel={lockLabel}
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <EditorRail
          activePanel={state.activePanel}
          onPanelChange={(panel) => {
            actions.setActivePanel(panel);
            setSidebarOpen(true);
          }}
        />
        <EditorSidebar
          activePanel={state.activePanel}
          canvasBg={state.canvasBg}
          onCanvasBgChange={actions.setCanvasBg}
          onAddText={actions.addText}
          onAddTextPreset={actions.addTextPreset}
          onAddShape={actions.addShape}
          onApplyModel={handleApplyModel}
          onApplyMeme={handleApplyMeme}
          search={state.search}
          onSearchChange={actions.setSearch}
          uploads={state.uploads}
          onAddUploadedImage={actions.addImage}
          onUseImageAsPage={actions.setImageAsPage}
          onUploadImagesClick={() => refs.fileInputRef.current?.click()}
          onUploadVideoClick={() => refs.videoInputRef.current?.click()}
          onImageUpload={actions.uploadImages}
          onVideoUpload={actions.uploadVideo}
          onClearVideo={actions.clearVideo}
          videoSrc={state.videoSrc}
          pageImageSrc={state.pageImageSrc}
          videoDuration={state.videoDuration}
          format={state.format}
          fileInputRef={refs.fileInputRef}
          videoInputRef={refs.videoInputRef}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <EditorCanvas
          format={state.format}
          canvasBg={state.canvasBg}
          elements={state.elements}
          selected={state.selected}
          selectedId={state.selectedId}
          displayScale={state.displayScale}
          canvasRef={refs.canvasRef}
          stageRef={refs.stageRef}
          videoElRef={refs.videoElRef}
          videoSrc={state.videoSrc}
          pageImageSrc={state.pageImageSrc}
          videoDuration={state.videoDuration}
          videoStart={state.videoStart}
          videoEnd={state.videoEnd}
          isExportingVideo={state.isExportingVideo}
          exportProgress={state.exportProgress}
          onClearSelection={actions.clearSelection}
          onSelectElement={actions.setSelectedId}
          onUpdateElement={actions.updateElement}
          onCommit={actions.commit}
          onDuplicateSelected={actions.duplicateSelected}
          onDeleteSelected={actions.deleteSelected}
          onRemoveBackground={actions.removeBackground}
          onSetAsPage={(image) => {
            actions.deleteSelected();
            actions.setImageAsPage(image.src);
          }}
          removingBgId={state.removingBgId}
          onVideoStartChange={actions.setVideoStart}
          onVideoEndChange={actions.setVideoEnd}
        />
      </div>

      <ShareDialog
        open={shareOpen}
        title={share.state.shareMessage.title}
        text={share.state.shareMessage.text}
        url={share.state.shareUrl}
        shareLinks={share.state.shareLinks}
        busy={share.state.busy}
        error={share.state.error}
        onClose={() => setShareOpen(false)}
        onShareNative={share.actions.shareNative}
        onCopyImageToClipboard={share.actions.copyImageToClipboard}
        onCopyLink={share.actions.copyLink}
      />
    </div>
  );
}
