import { MethodChip } from '../../../components/MethodChip';

export default {
  "index": {
    "display": "hidden"
  },
  "content-calendar": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Content Calendar</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "content-editor": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Content Editor</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "content-improve": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Content Improve</span>
        <MethodChip method="POST" />
      </div>
    )
  }
};
