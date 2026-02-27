import { MethodChip } from '../../../components/MethodChip';

export default {
  "index": "Overview",
  "authentication": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Authentication</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "instances": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Instances</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "plans": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Plans</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "utilities": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Utilities</span>
        <MethodChip method="POST" />
      </div>
    )
  }
};
