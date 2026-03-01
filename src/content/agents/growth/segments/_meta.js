import { MethodChip } from '../../../../components/MethodChip';

export default {
  "index": {
    "display": "hidden"
  },
  "icp": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>ICP Analysis</span>
        <MethodChip method="POST" />
      </div>
    )
  }
};
