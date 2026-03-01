import { MethodChip } from '../../../components/MethodChip';

export default {
  "index": {
    "display": "hidden"
  },
  "campaigns": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Campaigns</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "segments": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Segments</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "robot": "Robot"
};
