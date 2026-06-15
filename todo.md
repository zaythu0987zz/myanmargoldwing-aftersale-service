# Goldwing Service Record App - TODO

## Core Features

### 1. Product Information Section
- [x] Date field with date picker
- [x] Brand dropdown selector (DeLonghi, etc.)
- [x] Model and serial number input fields
- [x] Use-in-place field
- [x] Purchase location radio buttons (Myanmar / Overseas)

### 2. Customer Information Section
- [x] Customer name input field
- [x] Phone number input field
- [x] Address input field

### 3. Machine Issues & Checklist Section
- [x] IN time field
- [x] OUT time field
- [x] Service checklist with checkboxes (Coffee, Water, Descaling, Milk Clean)
- [x] Technical issues description textarea

### 4. Parts & Costs Section
- [x] Parts table with dynamic rows (Part name, Qty, Cost MMK)
- [x] Add/remove part rows functionality
- [x] Repaired-by field
- [x] Service charges input field
- [x] Auto-calculated total amount display

### 5. QR Code Generation
- [x] QR code generator button
- [x] Proper canvas element mounting before rendering
- [x] Encode full service record data into QR code
- [x] Display QR code accurately
- [x] Fix "canvas reference not available" error

### 6. Branding & Layout
- [x] Goldwing logo at top of page
- [x] Clean, professional layout
- [x] Responsive design for technician use
- [x] Professional styling matching original design

### 7. Data Management
- [x] Form state management
- [x] Form validation (required fields, error messages)
- [x] Data persistence (localStorage integration)

## Bug Fixes
- [x] Canvas reference not available error in QR code generation (FIXED)

## Testing
- [x] All form fields functional
- [x] QR code generation works without errors
- [x] Total amount calculates correctly
- [x] Responsive layout on mobile devices
- [x] All sections display correctly
- [x] Unit tests for calculations pass
- [x] QR data includes complete service record
- [x] Model and Serial Number fields separate

## Phase 3 Updates
- [x] Update logo to Goldwing official logo (IMG_4147.PNG)
- [x] Update brand dropdown to: DeLonghi, Kenwood, Braun, NutriBullet, Other
- [x] Increase logo size for better visibility

## Optional Enhancements (Future)
- [ ] Print service record functionality
- [ ] Email service record feature
- [ ] Multi-language support
- [ ] Database backend integration (currently using localStorage)
- [ ] User authentication and multi-user support

## New Features (Phase 2)

### 8. QR Code Scanner
- [x] Add QR code scanner library (html5-qrcode)
- [x] Create scanner UI component
- [x] Parse scanned QR data and populate form
- [x] Handle invalid QR codes gracefully

### 9. Service History & Records Management
- [x] Store all service records in localStorage with timestamps
- [x] Create service history page/view
- [x] Display list of all service records with customer name, date, total amount
- [x] View/edit/delete individual service records
- [x] Search/filter records by customer name, phone, or brand

### 10. Customer Search & Management
- [x] Add search functionality by customer name or phone
- [x] Display customer's previous service records
- [ ] Quick-fill customer info from previous records (optional)
- [x] Show customer service history when searching

### 11. Navigation & UI
- [x] Add navigation between Create Record and History pages
- [x] Create button-based navigation
- [x] Add back buttons for navigation
