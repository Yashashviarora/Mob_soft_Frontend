// Category -> dynamic spec-field configuration.
//
// This is the mechanism that lets the same product form adapt to different
// shop categories without code changes for *existing* categories, and
// degrades gracefully (generic key/value editor) for brand-new categories
// that don't have an entry here yet. To support a new category well, add a
// FieldDef[] entry keyed by the category's lowercased name.

export const CATEGORY_FIELD_CONFIG = {
  phones: [
    {
      key: "storage_gb",
      label: "Storage",
      type: "select",
      required: true,
      options: ["32", "64", "128", "256", "512", "1024"],
      unit: "GB",
    },
    {
      key: "ram_gb",
      label: "RAM",
      type: "select",
      options: ["2", "3", "4", "6", "8", "12", "16"],
      unit: "GB",
    },
    { key: "color", label: "Color", type: "text" },
    {
      key: "screen_size_in",
      label: "Screen Size",
      type: "number",
      unit: "in",
    },
    {
      key: "battery_mah",
      label: "Battery Capacity",
      type: "number",
      unit: "mAh",
    },
    {
      key: "network",
      label: "Network",
      type: "select",
      options: ["3G", "4G", "5G"],
    },
    {
      key: "sim_type",
      label: "SIM Type",
      type: "select",
      options: ["Single SIM", "Dual SIM", "eSIM"],
    },
    {
      key: "os",
      label: "Operating System",
      type: "select",
      options: ["Android", "iOS"],
    },
    { key: "imei", label: "IMEI", type: "text" },
    {
      key: "accessories_included",
      label: "Accessories Included",
      type: "text",
    },
  ],
  televisions: [
    {
      key: "screen_size_in",
      label: "Screen Size",
      type: "number",
      required: true,
      unit: "in",
    },
    {
      key: "resolution",
      label: "Resolution",
      type: "select",
      required: true,
      options: ["HD", "Full HD", "4K UHD", "8K"],
    },
    {
      key: "panel_type",
      label: "Panel Type",
      type: "select",
      options: ["LED", "OLED", "QLED", "LCD"],
    },
    { key: "smart_tv", label: "Smart TV", type: "boolean" },
    {
      key: "os",
      label: "Operating System",
      type: "select",
      options: ["Android TV", "WebOS", "Tizen", "None"],
    },
    { key: "hdmi_ports", label: "HDMI Ports", type: "number" },
    { key: "usb_ports", label: "USB Ports", type: "number" },
    {
      key: "refresh_rate_hz",
      label: "Refresh Rate",
      type: "select",
      options: ["60", "90", "120", "144"],
      unit: "Hz",
    },
    { key: "wall_mountable", label: "Wall Mountable", type: "boolean" },
  ],
  accessories: [
    {
      key: "accessory_type",
      label: "Accessory Type",
      type: "select",
      required: true,
      options: [
        "Cover/Case",
        "Screen Protector",
        "Earbuds/Headphones",
        "Charger/Cable",
        "Other",
      ],
    },
    { key: "compatible_models", label: "Compatible Models", type: "text" },
    { key: "color", label: "Color", type: "text" },
    {
      key: "material",
      label: "Material",
      type: "select",
      options: ["Silicone", "Leather", "Plastic", "Glass", "Metal"],
    },
    {
      key: "connectivity",
      label: "Connectivity",
      type: "select",
      options: ["Wired", "Bluetooth", "Wireless"],
    },
    {
      key: "battery_life_hrs",
      label: "Battery Life",
      type: "number",
      unit: "hrs",
    },
  ],
};

export function getFieldConfigForCategory(categoryName) {
  return CATEGORY_FIELD_CONFIG[categoryName.trim().toLowerCase()] ?? null;
}
