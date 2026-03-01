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
  }
};
