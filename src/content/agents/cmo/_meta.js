import { MethodChip } from '../../../components/MethodChip';

export default {
  "index": {
    "display": "hidden"
  },
  "daily-standup-system": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Standup System</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "daily-standup-sales": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Standup Sales</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "daily-standup-growth": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Standup Growth</span>
        <MethodChip method="POST" />
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
  "assign-leads": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Assign Leads</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "stakeholder-coordination": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Stakeholder Coordination</span>
        <MethodChip method="POST" />
      </div>
    )
  }
};
