import { FileDown } from "lucide-react";
import { useHackathonDraft } from "@/hackathon/hooks/useHackathonDraft";
import {
  buildShortlistGoogleDocHtml,
  buildUseCaseGoogleDocHtml,
  downloadGoogleDoc,
  slugCustomer,
} from "@/hackathon/utils/outcomeGoogleDoc";

export function OutcomeDocDownloads() {
  const { state, rankedShortlist, recordOutcomeDownload } = useHackathonDraft();

  if (rankedShortlist.length === 0) return null;

  const docContext = {
    brandName: state.brandName,
    curatedIndustry: state.curatedIndustry,
    curatedIndustryPhrase: state.curatedIndustryPhrase,
    intake: state.intake,
  };

  const downloadAll = () => {
    const html = buildShortlistGoogleDocHtml(docContext, rankedShortlist);
    downloadGoogleDoc(`${slugCustomer(state.intake.customerName)}-use-case-draft-shortlist`, html);
    recordOutcomeDownload("shortlist", rankedShortlist.length);
  };

  return (
    <div className="mt-6 rounded-dl border border-dl-border bg-dl-page p-4">
      <p className="text-sm font-semibold text-dl-text">Google Docs outcomes</p>
      <p className="mt-1 text-xs text-dl-text-secondary">
        Download Word-compatible briefs, then upload to Google Drive and open with Google Docs (or
        File → Open → Upload in Docs).
      </p>
      <button
        type="button"
        data-testid="download-shortlist-doc"
        onClick={downloadAll}
        className="mt-3 inline-flex items-center gap-2 rounded-dl bg-dl-brand px-4 py-2 text-sm font-medium text-white"
      >
        <FileDown className="h-4 w-4" />
        Download full shortlist (.doc)
      </button>
      <ul className="mt-4 space-y-2">
        {rankedShortlist.map((item, i) => (
          <li key={item.useCase.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-dl-text-secondary">
              {i + 1}. {item.useCase.title}
            </span>
            <button
              type="button"
              data-testid={`download-case-doc-${item.useCase.id}`}
              onClick={() => {
                const html = buildUseCaseGoogleDocHtml(docContext, item, i + 1);
                downloadGoogleDoc(
                  `${slugCustomer(state.intake.customerName)}-${item.useCase.id}`,
                  html
                );
                recordOutcomeDownload("use-case", item.useCase.id);
              }}
              className="inline-flex items-center gap-1 text-dl-brand underline"
            >
              <FileDown className="h-3 w-3" />
              Google Doc brief
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
