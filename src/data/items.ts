import { CATALOG_PART_1 } from './catalogPart1';
import { CATALOG_PART_2 } from './catalogPart2';
import { CATALOG_PART_3 } from './catalogPart3';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type PackShape =
  | 'bottle'
  | 'carton'
  | 'tin'
  | 'jar'
  | 'box'
  | 'pouch'
  | 'tray'
  | 'loaf'
  | 'punnet'
  | 'bar'
  | 'multipack'
  | 'tub'
  | 'roll';

export interface SupermarketItem {
  id: string;
  name: string;
  packSize: string;
  aisle: string;
  pricePence: number; // Exact UK supermarket price in pence (e.g., 145 = £1.45)
  image: string;
  funFact: string;
  tier: 'staple' | 'midtier' | 'specialty';
  promoNote?: string;
  packShape?: PackShape;
  accentColor?: string;
}

export const FLAGSHIP_PHOTOGRAPHED_ITEMS: SupermarketItem[] = [
  // =========================================================================
  // EVERYDAY STAPLES (Easy + Medium)
  // =========================================================================
  {
    id: 'milk-4pint',
    name: 'British Semi-Skimmed Milk',
    packSize: '4 Pints (2.27L)',
    aisle: 'Dairy & Chilled',
    pricePence: 145,
    image: '/src/assets/images/item_milk_4pint_1795139566869.jpg',
    funFact:
      'Packed with calcium and vitamin B12, semi-skimmed milk contains just 1.7% fat and accounts for over 60% of UK retail milk sales—carrying on a British dairy tradition dating back to Victorian doorstep deliveries.',
    tier: 'staple',
  },
  {
    id: 'white-loaf',
    name: 'Thick-Sliced White Toastie Loaf',
    packSize: '800g',
    aisle: 'Bakery',
    pricePence: 155,
    image: '/src/assets/images/item_white_loaf_1795139566712.jpg',
    funFact:
      'UK shoppers buy nearly 11 million loaves every single day. The modern British wrapped loaf owes its soft, even crumb to the Chorleywood Bread Process developed in Hertfordshire in 1961.',
    tier: 'staple',
  },
  {
    id: 'penne-pasta',
    name: 'Durum Wheat Penne Pasta',
    packSize: '500g',
    aisle: 'Food Cupboard',
    pricePence: 85,
    image: '/src/assets/images/item_penne_pasta_1795139566709.jpg',
    funFact:
      'Named after the Italian word for "quills", penne rigate features exterior ridges specifically engineered to trap rich tomato and cheese sauces on every tube.',
    tier: 'staple',
  },
  {
    id: 'orange-juice',
    name: 'Smooth Pure Orange Juice',
    packSize: '1 Litre Carton',
    aisle: 'Chilled Drinks',
    pricePence: 165,
    image: '/src/assets/images/item_orange_juice_1795139567476.jpg',
    funFact:
      'A single 150ml glass provides over 70% of your daily vitamin C. It takes roughly 10 to 12 ripe Valencia oranges to press a single one-litre supermarket carton.',
    tier: 'staple',
  },
  {
    id: 'free-range-eggs',
    name: 'British Free-Range Large Eggs',
    packSize: '6 Pack',
    aisle: 'Dairy & Eggs',
    pricePence: 215,
    image: '/src/assets/images/item_free_range_eggs_1795139566678.jpg',
    funFact:
      'Every British Lion egg carries a printed code showing its farming method—starting with "1" for free-range—and is rich in high-quality protein and vitamin D.',
    tier: 'staple',
  },
  {
    id: 'salted-butter',
    name: 'British Salted Block Butter',
    packSize: '250g',
    aisle: 'Dairy & Chilled',
    pricePence: 215,
    image: '/src/assets/images/item_salted_butter_1795139565699.jpg',
    funFact:
      'It takes around 5.5 litres of whole British milk to churn just one 250g foil-wrapped block of butter. Salt was originally added as a natural preservative before home fridges existed.',
    tier: 'staple',
  },
  {
    id: 'choc-digestives',
    name: 'Milk Chocolate Digestive Biscuits',
    packSize: '266g Pack',
    aisle: 'Biscuits & Snacks',
    pricePence: 200,
    image: '/src/assets/images/item_choc_digestives_1795139566007.jpg',
    funFact:
      'Invented in Scotland in 1892 with bicarbonate of soda thought to aid digestion, the chocolate-coated version debuted in 1925—and the chocolate side is technically the bottom of the biscuit.',
    tier: 'staple',
  },
  {
    id: 'crisps-multipack',
    name: 'Ready Salted Potato Crisps',
    packSize: '6 x 25g Multipack',
    aisle: 'Crisps & Snacks',
    pricePence: 195,
    image: '/src/assets/images/item_crisps_multipack_1795139565727.jpg',
    funFact:
      'Early UK crisp packets came with a tiny twisted blue paper sachet of salt inside so shoppers could season their own bag before pre-salted flavouring became standard in the 1960s.',
    tier: 'staple',
  },
  {
    id: 'mature-cheddar',
    name: 'British Mature Cheddar Block',
    packSize: '350g',
    aisle: 'Dairy & Cheese',
    pricePence: 315,
    image: '/src/assets/images/item_mature_cheddar_1795139566332.jpg',
    funFact:
      'Originating in the Somerset village of Cheddar in the 12th century, mature cheddar is aged for at least 9 months to develop its signature sharp tang and crumbly texture.',
    tier: 'staple',
  },
  {
    id: 'baked-beans',
    name: 'Baked Beans in Tomato Sauce',
    packSize: '4 x 415g Multipack',
    aisle: 'Food Cupboard',
    pricePence: 375,
    image: '/src/assets/images/item_baked_beans_1795139566006.jpg',
    funFact:
      'Britons eat over 2 million tins of baked beans every day. Made from haricot beans packed with plant fibre, they were first sold in London in 1886 as a luxury delicacy at Fortnum & Mason.',
    tier: 'staple',
  },
  {
    id: 'bananas-bunch',
    name: 'Fairtrade Ripe Bananas',
    packSize: '5 Pack',
    aisle: 'Fresh Produce',
    pricePence: 80,
    image: '/src/assets/images/item_bananas_bunch_1795140266422.jpg',
    funFact:
      'Bananas are the single best-selling product in UK supermarkets by volume—shoppers buy over 5 billion every year. Botanically they are berries rich in potassium and vitamin B6.',
    tier: 'staple',
  },
  {
    id: 'british-carrots',
    name: 'British Washed Carrots',
    packSize: '1kg Bag',
    aisle: 'Fresh Produce',
    pricePence: 69,
    image: '/src/assets/images/item_british_carrots_1795140268999.jpg',
    funFact:
      'Before the 17th century, most cultivated carrots were purple or yellow—Dutch growers bred the bright orange variety packed with beta-carotene, which the body converts into vitamin A.',
    tier: 'staple',
  },
  {
    id: 'crumpets-6pack',
    name: 'Thick British Crumpets',
    packSize: '6 Pack',
    aisle: 'Bakery',
    pricePence: 115,
    image: '/src/assets/images/item_crumpets_6pack_1795140272514.jpg',
    funFact:
      'A quintessential British griddle cake dating to the 17th century, crumpets owe their signature butter-catching tunnels to carbon dioxide bubbles bursting through a yeasted batter on a hot plate.',
    tier: 'staple',
  },
  {
    id: 'porridge-oats',
    name: 'Scottish Rolled Porridge Oats',
    packSize: '1kg Bag',
    aisle: 'Breakfast Cereals',
    pricePence: 135,
    image: '/src/assets/images/item_porridge_oats_1795140267230.jpg',
    funFact:
      'Scotland’s cool, damp climate produces plump oats loaded with beta-glucan, a soluble fibre clinically shown to help lower cholesterol while providing slow-release morning energy.',
    tier: 'staple',
  },
  {
    id: 'frozen-peas',
    name: 'Sweet British Garden Peas',
    packSize: '900g Freezer Bag',
    aisle: 'Frozen Food',
    pricePence: 175,
    image: '/src/assets/images/item_frozen_peas_1795140268385.jpg',
    funFact:
      'UK pea harvesters race the clock during summer: garden peas are podded and blast-frozen within just 150 minutes of leaving the field, locking in more vitamin C than fresh peas stored for days.',
    tier: 'staple',
  },
  {
    id: 'strawberry-jam',
    name: 'British Strawberry Conserve',
    packSize: '454g Jar',
    aisle: 'Jams & Spreads',
    pricePence: 165,
    image: '/src/assets/images/item_strawberry_jam_1795140266878.jpg',
    funFact:
      'Notice the classic 454g jar weight? That exact figure is a holdover from the traditional British imperial one-pound (1 lb) preserve jar still standard across UK jam shelves today.',
    tier: 'staple',
  },
  {
    id: 'tomato-ketchup',
    name: 'Classic Tomato Ketchup',
    packSize: '460g Squeezy Bottle',
    aisle: 'Table Sauces',
    pricePence: 340,
    image: '/src/assets/images/item_tomato_ketchup_1795140268323.jpg',
    funFact:
      'Early 18th-century British ketchups contained no tomatoes at all—they were fermented mushroom, walnut, or anchovy sauces inspired by Southeast Asian trade before tomato recipes took over in the 1800s.',
    tier: 'staple',
  },
  {
    id: 'washing-up-liquid',
    name: 'Original Green Washing-Up Liquid',
    packSize: '433ml Bottle',
    aisle: 'Household',
    pricePence: 150,
    image: '/src/assets/images/item_washing_up_liquid_1795140266974.jpg',
    funFact:
      'First launched in the UK in 1950, green washing-up liquid became a British kitchen icon—and its empty white plastic bottles starred for decades as spaceships in children’s TV craft projects.',
    tier: 'staple',
  },
  {
    id: 'toilet-rolls-9pk',
    name: 'Quilted 3-Ply Toilet Tissue',
    packSize: '9 Mega Rolls',
    aisle: 'Household',
    pricePence: 475,
    image: '/src/assets/images/item_toilet_rolls_9pk_1795140269415.jpg',
    funFact:
      'Perforated toilet tissue rolls were first manufactured in Britain in 1879. Modern 3-ply quilted rolls use microscopic air pockets pressed between pulp layers to boost absorbency without extra paper.',
    tier: 'staple',
  },
  {
    id: 'baking-potatoes',
    name: 'British Large Baking Potatoes',
    packSize: '4 Pack',
    aisle: 'Fresh Produce',
    pricePence: 95,
    image: '/src/assets/images/item_baking_potatoes_1795140395991.jpg',
    funFact:
      'Floury British baking varieties like Maris Piper and King Edward have high dry-matter starch content—turning fluffy inside while their skins crisp up in the oven. Potatoes also contain more potassium than bananas.',
    tier: 'staple',
  },
  {
    id: 'fish-fingers',
    name: 'Crispy Breaded Cod Fish Fingers',
    packSize: '10 Pack (280g)',
    aisle: 'Frozen Food',
    pricePence: 320,
    image: '/src/assets/images/item_fish_fingers_1795140395924.jpg',
    funFact:
      'Invented in Great Yarmouth in 1955 after herring-finger trials lost out to cod in consumer taste tests, fish fingers became an overnight UK freezer staple—with Britons now eating over 1.5 million every day.',
    tier: 'staple',
  },
  {
    id: 'cornflakes-box',
    name: 'Golden Crunchy Corn Flakes',
    packSize: '500g Box',
    aisle: 'Breakfast Cereals',
    pricePence: 250,
    image: '/src/assets/images/item_cornflakes_box_1795140394780.jpg',
    funFact:
      'Created by accident in 1894 when boiled grain was left out overnight and flattened through rollers, supermarket corn flakes in the UK are fortified with iron, folic acid, and B vitamins.',
    tier: 'staple',
  },
  {
    id: 'basmati-rice',
    name: 'Pure Long-Grain White Basmati Rice',
    packSize: '1kg Bag',
    aisle: 'World & Cupboard',
    pricePence: 215,
    image: '/src/assets/images/item_basmati_rice_1795140398063.jpg',
    funFact:
      'Grown in the Himalayan foothills and aged for months before milling, Basmati means "fragrant" in Sanskrit—its slender grains double in length without sticking together when steamed.',
    tier: 'staple',
  },

  // =========================================================================
  // MID-TIER & CLASSIC SUPERMARKET FAVOURITES (Medium + Hard)
  // =========================================================================
  {
    id: 'tea-bags',
    name: 'English Breakfast Tea Bags',
    packSize: '80 Pack (250g)',
    aisle: 'Tea & Coffee',
    pricePence: 325,
    image: '/src/assets/images/item_tea_bags_1795139567425.jpg',
    funFact:
      'The UK brews around 100 million cups of tea daily, with 96% made using tea bags. Modern blends combine malty Assam leaves with brisk East African black teas for a bold colour with milk.',
    tier: 'midtier',
  },
  {
    id: 'meal-deal-sandwich',
    name: 'Chicken, Crispy Bacon & Mayo Sandwich',
    packSize: '185g (Meal Deal Main)',
    aisle: 'Food to Go',
    pricePence: 300,
    image: '/src/assets/images/item_meal_deal_sandwich_1795139566977.jpg',
    funFact:
      'The triangular supermarket sandwich skillet was invented in the UK in 1980 so shoppers could inspect the filling edge-to-edge. Chicken, bacon & mayo consistently ranks in the British top three.',
    tier: 'midtier',
    promoNote: 'Meal Deal Main',
  },
  {
    id: 'greek-yogurt',
    name: 'Greek-Style Natural Yogurt',
    packSize: '500g Pot',
    aisle: 'Dairy & Chilled',
    pricePence: 130,
    image: '/src/assets/images/item_greek_yogurt_1795140268386.jpg',
    funFact:
      'Strained to remove excess liquid whey, thick Greek-style yogurt packs nearly twice the protein of standard yogurt while delivering live cultures that support digestive health.',
    tier: 'midtier',
  },
  {
    id: 'classic-hummus',
    name: 'Creamy Chickpea Houmous',
    packSize: '200g Deli Tub',
    aisle: 'Chilled Deli',
    pricePence: 125,
    image: '/src/assets/images/item_classic_hummus_1795140267582.jpg',
    funFact:
      'UK shoppers are Europe’s biggest fans of houmous, consuming over 12,000 tonnes a year—making the blended chickpea and sesame tahini dip a fixture in British lunchboxes.',
    tier: 'midtier',
  },
  {
    id: 'strawberries-punnet',
    name: 'British Class 1 Strawberries',
    packSize: '400g Punnet',
    aisle: 'Fresh Produce',
    pricePence: 250,
    image: '/src/assets/images/item_strawberries_punnet_1795140267741.jpg',
    funFact:
      'Strawberries are the only fruit with seeds on the outside—around 200 tiny achenes per berry. Eight medium British strawberries actually contain more vitamin C than an entire orange.',
    tier: 'midtier',
    promoNote: 'Seasonal Pick',
  },
  {
    id: 'oven-chips',
    name: 'Homestyle Thick Oven Chips',
    packSize: '1.5kg Freezer Bag',
    aisle: 'Frozen Food',
    pricePence: 285,
    image: '/src/assets/images/item_oven_chips_1795140267800.jpg',
    funFact:
      'Frozen oven chips revolutionised UK weeknight dinners in 1979 by lightly par-frying Maris Piper and similar floury potatoes before freezing so they crisp up in a standard oven.',
    tier: 'midtier',
  },
  {
    id: 'margherita-pizza',
    name: 'Chilled Stonebaked Margherita Pizza',
    packSize: '320g',
    aisle: 'Chilled Ready Meals',
    pricePence: 350,
    image: '/src/assets/images/item_margherita_pizza_1795140267967.jpg',
    funFact:
      'Named in 1889 after Queen Margherita of Savoy, the classic trio of red tomato, white mozzarella, and green basil was crafted to mirror the tricolour flag of unified Italy.',
    tier: 'midtier',
  },
  {
    id: 'cola-cans-8pk',
    name: 'Classic Cola Fridge Pack',
    packSize: '8 x 330ml Cans',
    aisle: 'Soft Drinks',
    pricePence: 495,
    image: '/src/assets/images/item_cola_cans_8pk_1795140268518.jpg',
    funFact:
      'Aluminium drinks cans chill far faster than glass and can be recycled infinitely—an empty UK cola can collected at kerbside can return to a supermarket shelf as a new can in just 60 days.',
    tier: 'midtier',
    promoNote: 'Fridge Pack',
  },
  {
    id: 'chicken-breasts',
    name: 'British Skinless Chicken Breast Fillets',
    packSize: '650g (5 Fillets)',
    aisle: 'Chilled Meat',
    pricePence: 650,
    image: '/src/assets/images/item_chicken_breasts_1795140268519.jpg',
    funFact:
      'Chicken makes up roughly half of all meat eaten in Britain. Skinless breast fillet is one of the leanest supermarket proteins, packing over 24g of protein per 100g with barely 1.2g of fat.',
    tier: 'midtier',
  },
  {
    id: 'yeast-extract',
    name: 'Classic Yeast Extract Spread',
    packSize: '250g Jar',
    aisle: 'Jams & Spreads',
    pricePence: 365,
    image: '/src/assets/images/item_yeast_extract_1795140269130.jpg',
    funFact:
      'Created in Burton-upon-Trent in 1902 from brewer’s yeast left over from beer making, a single thin scrape on toast delivers a hefty hit of folic acid, niacin, and vitamin B12.',
    tier: 'midtier',
  },
  {
    id: 'smoked-bacon',
    name: 'British Smoked Back Bacon',
    packSize: '300g Thick Cut',
    aisle: 'Chilled Meat',
    pricePence: 260,
    image: '/src/assets/images/item_smoked_bacon_1795140396763.jpg',
    funFact:
      'Unlike American streaky belly bacon, traditional British back bacon combines the lean loin medallion with a short tail of streaky belly, cured and gently smoked over beech or oak wood.',
    tier: 'midtier',
  },
  {
    id: 'cumberland-sausages',
    name: 'Thick Pork Cumberland Sausages',
    packSize: '6 Pack (400g)',
    aisle: 'Chilled Meat',
    pricePence: 275,
    image: '/src/assets/images/item_cumberland_sausages_1795140396223.jpg',
    funFact:
      'Originally coiled in Cumbria using coarse-chopped pork and generous cracked black pepper brought through the historic port of Whitehaven, Cumberland sausages are prized for their hearty texture.',
    tier: 'midtier',
  },
  {
    id: 'instant-coffee',
    name: 'Finest Roast Instant Coffee Granules',
    packSize: '200g Glass Jar',
    aisle: 'Tea & Coffee',
    pricePence: 450,
    image: '/src/assets/images/item_instant_coffee_1795140396092.jpg',
    funFact:
      'Freeze-dried instant coffee is brewed in huge vats, flash-frozen to -40°C, and vacuum-dried so ice evaporates straight to vapour—preserving delicate roasted aromatics without scorching.',
    tier: 'midtier',
  },
  {
    id: 'peanut-butter',
    name: 'Crunchy Roasted Peanut Butter',
    packSize: '340g Glass Jar',
    aisle: 'Jams & Spreads',
    pricePence: 240,
    image: '/src/assets/images/item_peanut_butter_1795140394292.jpg',
    funFact:
      'Botanically legumes rather than tree nuts, peanuts grow underground. It takes around 540 roasted peanuts to produce a single 340g jar of natural protein-rich peanut butter.',
    tier: 'midtier',
  },
  {
    id: 'avocados-2pk',
    name: 'Ripe & Ready Hass Avocados',
    packSize: '2 Pack',
    aisle: 'Fresh Produce',
    pricePence: 175,
    image: '/src/assets/images/item_avocados_2pk_1795140396426.jpg',
    funFact:
      'Virtually every Hass avocado sold worldwide traces back to a single mother tree planted by postman Rudolph Hass in California in 1926. Their pebbly skin darkens from green to purple-black as they ripen.',
    tier: 'midtier',
  },

  // =========================================================================
  // SPECIALTY, FINEST & NICHE ITEMS (Hard + Selected Medium)
  // =========================================================================
  {
    id: 'sourdough-boule',
    name: 'Artisan Crusty Sourdough Boule',
    packSize: '400g Bakery Loaf',
    aisle: 'In-Store Bakery',
    pricePence: 220,
    image: '/src/assets/images/item_sourdough_boule_1795139650879.jpg',
    funFact:
      'Slow-fermented with wild yeast and lactic acid bacteria for up to 24 hours, sourdough breaks down starches more gently than standard loaves and keeps its blistered crust crisp for days.',
    tier: 'specialty',
    promoNote: 'In-Store Bakery',
  },
  {
    id: 'lemon-curd',
    name: 'Finest Sicilian Lemon Curd',
    packSize: '310g Jar',
    aisle: 'Jams & Spreads',
    pricePence: 230,
    image: '/src/assets/images/item_lemon_curd_1795139651165.jpg',
    funFact:
      'A quintessential 19th-century English afternoon tea spread traditionally cooked with butter, eggs, sugar, and zesty southern Italian lemons—originally served alongside scones as a sharper rival to jam.',
    tier: 'specialty',
    promoNote: 'Finest Range',
  },
  {
    id: 'truffle-crisps',
    name: 'Finest Truffle & Black Pepper Crisps',
    packSize: '150g Sharing Bag',
    aisle: 'Finest Snacks',
    pricePence: 175,
    image: '/src/assets/images/item_truffle_crisps_1795139651698.jpg',
    funFact:
      'Batch-fried in skins at lower temperatures for a firmer crunch, hand-cooked sharing crisps use thick-cut British potatoes and aromatic black summer truffle seasoning.',
    tier: 'specialty',
    promoNote: 'Club Offer Price',
  },
  {
    id: 'barista-oat-drink',
    name: 'Barista Edition Oat Drink',
    packSize: '1 Litre Carton',
    aisle: 'Free From & Plant',
    pricePence: 210,
    image: '/src/assets/images/item_barista_oat_drink_1795140267074.jpg',
    funFact:
      'Oat milk has overtaken almond and soya as Britain’s favourite plant-based dairy alternative. Barista editions include acidity regulators so the oat proteins steam into velvety microfoam without splitting in hot espresso.',
    tier: 'specialty',
    promoNote: 'Plant-Based',
  },
  {
    id: 'dark-choc-70',
    name: 'Finest 70% Single-Origin Dark Chocolate',
    packSize: '100g Bar',
    aisle: 'Confectionery',
    pricePence: 240,
    image: '/src/assets/images/item_dark_choc_70_1795140396025.jpg',
    funFact:
      'Single-origin Madagascan cacao beans are prized by chocolatiers for their natural red-berry brightness—requiring minimal added sugar while delivering rich antioxidant flavanols.',
    tier: 'specialty',
    promoNote: 'Finest Range',
  },
  {
    id: 'balsamic-glaze',
    name: 'Aged Modena Balsamic Glaze',
    packSize: '250ml Glass Bottle',
    aisle: 'World & Cooking',
    pricePence: 310,
    image: '/src/assets/images/item_balsamic_glaze_1795140395252.jpg',
    funFact:
      'Crafted from concentrated Trebbiano and Lambrusco grape must aged in wooden casks in Modena, Italy, balsamic glaze is gently reduced into a glossy drizzle for tomatoes, mozzarella, and roasted veg.',
    tier: 'specialty',
    promoNote: 'Italian Deli',
  },
  {
    id: 'smoked-salmon',
    name: 'Finest Scottish Smoked Salmon',
    packSize: '100g Chilled Pack',
    aisle: 'Chilled Fish',
    pricePence: 450,
    image: '/src/assets/images/item_smoked_salmon_1795139651169.jpg',
    funFact:
      'Cured in sea salt and cold-smoked over reclaimed Highland oak and whisky barrel shavings, Scottish salmon is a prized source of omega-3 fatty acids and holds Protected Geographical Indication status.',
    tier: 'specialty',
    promoNote: 'Finest Range',
  },
  {
    id: 'prosciutto-pack',
    name: 'Italian Prosciutto Crudo Slices',
    packSize: '80g Chilled Pack',
    aisle: 'Continental Deli',
    pricePence: 450,
    image: '/src/assets/images/item_prosciutto_pack_1795140270938.jpg',
    funFact:
      'Air-dried for at least 12 months in the cool breezes of northern Italy using nothing more than pork leg and sea salt, prosciutto crudo is sliced wafer-thin so its marbling melts immediately on the palate.',
    tier: 'specialty',
    promoNote: 'Continental Deli',
  },
  {
    id: 'parmigiano-wedge',
    name: 'Parmigiano Reggiano D.O.P. Wedge',
    packSize: '200g (24-Month Aged)',
    aisle: 'Specialty Cheese',
    pricePence: 460,
    image: '/src/assets/images/item_parmigiano_wedge_1795140269229.jpg',
    funFact:
      'Every wheel of Parmigiano Reggiano requires around 550 litres of milk and is inspected with a tiny silver hammer to listen for air pockets. Its crunchy white flecks are natural amino-acid tyrosine crystals.',
    tier: 'specialty',
    promoNote: 'D.O.P. Aged 24m',
  },
  {
    id: 'laundry-pods',
    name: 'Bio All-in-One Laundry Pods',
    packSize: '24 Washes Tub',
    aisle: 'Household',
    pricePence: 600,
    image: '/src/assets/images/item_laundry_pods_1795140396917.jpg',
    funFact:
      'Biological laundry capsules use targeted natural enzymes—protease, amylase, and lipase—to break down protein, starch, and grease stains even at energy-saving 30°C cold wash temperatures.',
    tier: 'specialty',
    promoNote: 'Club Offer Item',
  },
  {
    id: 'sirloin-steak',
    name: 'Finest 30-Day Matured Sirloin Steak',
    packSize: '227g (8oz)',
    aisle: 'Finest Butcher',
    pricePence: 625,
    image: '/src/assets/images/item_sirloin_steak_1795140396989.jpg',
    funFact:
      'Dry-maturing British beef on the bone for 30 days allows natural enzymes to tenderise muscle fibres while gentle moisture loss concentrates its rich, nutty flavour.',
    tier: 'specialty',
    promoNote: 'Finest Butcher',
  },
  {
    id: 'olive-oil',
    name: 'Cold-Pressed Extra Virgin Olive Oil',
    packSize: '500ml Glass Bottle',
    aisle: 'Cooking Oils',
    pricePence: 675,
    image: '/src/assets/images/item_olive_oil_1795139651402.jpg',
    funFact:
      'Dark green glass bottles shield extra virgin olive oil from UV light, preserving its peppery polyphenols. Mediterranean droughts caused UK retail olive oil prices to nearly double over three years.',
    tier: 'specialty',
    promoNote: 'Seasonal Harvest',
  },
  {
    id: 'dishwasher-tabs',
    name: 'Ultra Platinum Dishwasher Capsules',
    packSize: '32 Pack Pouch',
    aisle: 'Household',
    pricePence: 850,
    image: '/src/assets/images/item_dishwasher_tabs_1795140268094.jpg',
    funFact:
      'Multi-chamber dishwasher pods are wrapped in water-soluble PVA film that dissolves at exact temperatures during the cycle—releasing grease-cutting enzymes first and rinse aid last.',
    tier: 'specialty',
    promoNote: 'Club Offer Item',
  },
  {
    id: 'manuka-honey',
    name: 'New Zealand Manuka Honey MGO 100+',
    packSize: '250g Jar',
    aisle: 'Specialty Spreads',
    pricePence: 1150,
    image: '/src/assets/images/item_manuka_honey_1795139651069.jpg',
    funFact:
      'Harvested exclusively from the native Leptospermum scoparium shrub in New Zealand—which flowers for only 2 to 6 weeks a year—its MGO rating measures natural methylglyoxal concentration.',
    tier: 'specialty',
    promoNote: 'Niche Specialty',
  },
];

export const SUPERMARKET_ITEMS: SupermarketItem[] = [
  ...FLAGSHIP_PHOTOGRAPHED_ITEMS,
  ...CATALOG_PART_1,
  ...CATALOG_PART_2,
  ...CATALOG_PART_3,
];

export function getItemsPoolForDifficulty(difficulty: Difficulty): SupermarketItem[] {
  if (difficulty === 'easy') {
    // Everyday UK supermarket staples
    return SUPERMARKET_ITEMS.filter((item) => item.tier === 'staple');
  }
  if (difficulty === 'medium') {
    // Broad supermarket mix of everyday staples, mid-tier classics, and accessible Finest items
    return SUPERMARKET_ITEMS.filter(
      (item) =>
        item.tier === 'staple' ||
        item.tier === 'midtier' ||
        item.id === 'sourdough-boule' ||
        item.id === 'lemon-curd' ||
        item.id === 'truffle-crisps' ||
        item.id === 'barista-oat-drink' ||
        item.id === 'dark-choc-70'
    );
  }
  // Hard: All specialty/Finest/niche items + mid-tier/chilled/multipack items
  return SUPERMARKET_ITEMS.filter(
    (item) => item.tier === 'specialty' || item.tier === 'midtier'
  );
}
