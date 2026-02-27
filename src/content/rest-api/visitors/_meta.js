import { MethodChip } from '../../../components/MethodChip';

export default {
  "index": "Overview",
  "sessions": "Sessions",
  "setup": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Setup</span>
        <MethodChip method="GET" />
      </div>
    )
  },
  "sites": "Sites",
  "tracking": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Tracking</span>
        <MethodChip method="POST" />
      </div>
    )
  }
};
