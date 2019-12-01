## Legends
X: number of locations to find
B: Extra buffer locations to find

## Steps
1) Find all properties within location -> NEARBY_PROPS
2) Find all the unavailable properties -> NEARBY_UNAVAILABLE
3) Filter available properties within search date and variable pricing-> VARIABLE_PROPS 
4) Check for any NEARBY_PROPS that appear as unavailable in UNAVAILABLE_PROPS or as VARIABLE_PRICING -> NEARBY_AVAILABLE_PROPS with variable pricing
5) Find 10 cheapest NEARBY_AVAILABLE_PROPS sorted by their nightly (price + VARIABLE_PRICE)

## Thought process
1) Narrow down the scope of the dataset by performaing large filters that can eliminate as much of the data as possible
2) Try to perform only O(1) or O(N) searches. Using the database inbuild search methods would most likely be efficient due to hashing / indexing
3) Sorting is generally more expensive than filtering / indexing, thus leaving it for the last step


## Reflections after writing code
1) Went down the wrong path for logic. Had to take a step back and redo. `getVariableProp` was too messy
2) For optimisations, need to minimize calls to DB. Need to ensure sortining is minized down to smallest dataset

