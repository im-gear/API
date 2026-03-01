import { MethodChip } from '../../../components/MethodChip';

export default {
  "index": {
    "display": "hidden"
  },
  "webhook": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Webhook</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "analyze": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Analyze</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "create-template": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Create Template</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "send-template": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Send Template</span>
        <MethodChip method="POST" />
      </div>
    )
  }
};
