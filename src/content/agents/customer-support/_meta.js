import { MethodChip } from '../../../components/MethodChip';

export default {
  "index": {
    "display": "hidden"
  },
  "message": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Message</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "conversations": {
    title: "Conversations"
  },
  "status": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Status</span>
        <MethodChip method="GET" />
      </div>
    )
  }
};
