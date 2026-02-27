import { MethodChip } from '../../../components/MethodChip';

export default {
  "index": "Overview",
  "role-search": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Role Search</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "contact-lookup": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Contact Lookup</span>
        <MethodChip method="POST" />
      </div>
    )
  },
  "icp": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>ICP</span>
        <MethodChip method="GET" />
      </div>
    )
  },
  "autocomplete": {
    title: (
      <div className="sidebar-title-wrapper">
        <span>Autocomplete</span>
        <MethodChip method="GET" />
      </div>
    )
  }
};
