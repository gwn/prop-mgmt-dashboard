# Requirements Spec

Build a Property Dashboard with a guided creation flow.

 
## Step 1: Dashboard

- Show a list of all properties with their name, type, and unique
  number

- Include a button to create a new property → this opens the
  creation flow


## Step 2: Property Creation Flow

When the user clicks "Create new property", they should be guided
through three steps:


### 1. General Info

- Select management type (WEG or MV)

- Enter property name

- Assign property manager and accountant

- File Upload for the declaration of division (Teilungserklärung).

- The Teilungserklärung (attached) contains most of the
  information required for all three steps (property, buildings,
  units). You may optionally use AI to extract and pre-fill these
  details.  


### 2. Building Data

- Each property can contain multiple buildings

- For each building: enter street, house number, and other details
   

### 3. Units

- Add units to buildings

- Supported unit types: Apartment, Office, Garden, Parking

- For each unit, capture: number, type, building, floor, entrance,
  size, co-ownership share, construction year, rooms


## Efficiency Challenge

The flow should make it possible to enter data for a property with
60+ units quickly and efficiently.
