import { MethodChip } from '../../../components/MethodChip';

export default {
  "index": {
    "display": "hidden"
  },
  "analysis": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Analysis</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "lead-segmentation": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Lead Segmentation</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "lead-contact-generation": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Lead Contact Generation</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "company-contact-generation": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Company Contact Generation</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "deep-research": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Deep Research</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "search": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Search</span>
        <MethodChip method="POST" />
      </div>
    )
  }
};
