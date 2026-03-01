import { MethodChip } from '../../../../components/MethodChip';

export default {
  "index": {
    "display": "hidden"
  },
  "messages": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Messages</span>
        <MethodChip method="GET" />
      </div>
    )
  }
};
