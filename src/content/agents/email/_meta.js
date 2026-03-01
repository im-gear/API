import { MethodChip } from '../../../components/MethodChip';

export default {
  "index": {
    "display": "hidden"
  },
  "analyze": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Analyze</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "check": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Check</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "reply": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Reply</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "alias-reply": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Alias Reply</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "leads-reply": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Leads Reply</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "delivery-status": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Delivery Status</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "sync": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Sync</span>
        <MethodChip method="POST" />
      </div>
    )
  }
};
