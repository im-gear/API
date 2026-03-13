import { MethodChip } from '../../../components/MethodChip';

export default {
  "index": "Overview",
  "get": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Get Requirements</span>
        <MethodChip method="GET" />
      </div>
    )
  },
  "status": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Get Requirement Status</span>
        <MethodChip method="GET" />
      </div>
    )
  }
};