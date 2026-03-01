import { MethodChip } from '../../../components/MethodChip';

export default {
  "index": {
    "display": "hidden"
  },
  "websocket": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>WebSocket</span>
        <MethodChip method="GET" />
      </div>
    )
  },
  "message": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Message</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "intervention": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Intervention</span>
        <MethodChip method="POST" />
      </div>
    )
  }
};
