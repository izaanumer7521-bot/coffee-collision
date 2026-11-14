// The full Evara menu, English + Arabic. Prices are in Saudi riyals (SAR), exactly as printed on the menu.
// price: null  -> the printed menu shows no price for that item (the website shows "Price in store"
//                 and it cannot be ordered online until you set a price in Admin -> Products).
// [English name, Arabic name, price]
module.exports = [
  { slug: 'drip-coffee', name: 'Drip Coffee', nameAr: 'قهوة مقطرة', items: [
    ['Coffee Day Small', 'قهوة اليوم صغير', 10],
    ['Coffee Day Big', 'قهوة اليوم كبير', 12],
    ['Coffee Day Box', 'قهوة اليوم بوكس', 40],
    ['V60 Classic', 'في60 كلاسيك', 18],
    ['V60 Special', 'في60 سبيشل', 19],
  ] },
  { slug: 'hot-beverages', name: 'Hot Beverages', nameAr: 'المشروبات الساخنة', items: [
    ['Espresso', 'اسبرسو', 12],
    ['Macchiato', 'ماكياتو', 14],
    ['Americano', 'امريكانو', 12],
    ['Cortado', 'كورتادو', 14],
    ['Flat White', 'فلات وايت', 14],
    ['Cappuccino', 'كابتشينو', 14],
    ['Latte', 'لاتيه', 14],
    ['Spanish Latte', 'سبانش لاتيه', 15],
    ['Caramel Macchiato', 'كراميل ماكياتو', 15],
    ['Mocha', 'موكا', 15],
    ['Hot Chocolate', 'شوكولاتة ساخنة', 14],
    ['Matcha Latte', 'ماتشا لاتيه', 18],
    ['Matcha Spanish', 'ماتشا سبانش', 18],
    ['Turkish Coffee', 'قهوة تركي', 12],
  ] },
  { slug: 'tea', name: 'Tea', nameAr: 'شاي', items: [
    ['Karak Tea', 'شاي كرك', 12],
    ['Red Tea', 'شاي احمر', 8],
    ['Green Tea', 'شاي اخضر', 8],
  ] },
  { slug: 'cold-beverages', name: 'Cold Beverages', nameAr: 'مشروبات باردة', items: [
    ['Americano', 'امريكانو', 12],
    ['Latte', 'لاتيه', 17],
    ['Spanish Latte', 'سبانش لاتيه', 18],
    ['Mocha Frappacchino', 'موكا فرابتشينو', 19],
    ['Ice Shaken', 'ايس شيكن وايت موكا', 18],
    ['Ice Tea Peach', 'ايس تي خوخ', 15],
    ['Ice Tea Passion Fruit', 'ايس تي باشن فروت', 15],
    ['Ice Chocolate', 'ايس شوكولاتة', 18],
    ['Matcha Vanilla Latte', 'ماتشا فانيلا لاتيه', 19],
    ['Matcha Spanish Latte', 'ماتشا سبانش لاتيه', 19],
    ['Matcha Blueberry', 'ماتشا بلوبيري', 20],
    ['Karkadeh Small', 'كركديه صغير', 14],
    ['Karkadeh Big', 'كركديه كبير', 16],
    ['Karkadeh Box', 'كركديه بوكس', 40],
    ['Tiramisu Latte', 'تراميسو لاتيه', 19],
  ] },
  { slug: 'mojito', name: 'Mojito', nameAr: 'موهيتو', items: [
    ['Black Mojito', 'موهيتو اسود', null],
    ['Red Mojito', 'موهيتو احمر', null],
    ['Blue Mojito', 'موهيتو ازرق', null],
  ] },
  // The printed menu lists these three under the mojito column with no heading of their own.
  { slug: 'soft-drinks', name: 'Soft Drinks', nameAr: 'مشروبات غازية', items: [
    ['Soda', 'صودا', 13],
    ['7up', 'سفن اب', 14],
    ['Code Red', 'كود ريد', 16],
  ] },
  { slug: 'desserts', name: 'Desserts', nameAr: 'حلويات', items: [
    ['Signature Nutella Cake', 'كيكة نوتيلا سجنيتشر', 19],
    ['Tiramisu', 'تراميسو ايطالي', 22],
    ['NewYork Cheese Cake', 'تشيز كيك نيويورك', 22],
    ['Red Velvet Cake', 'كيكة ريد فلفت', 16],
    ['Russian Honey Cake', 'كيكة عسل روسي', 18],
    ['Mini Brownies', 'ميني براونيز', 10],
    ['Choco Brownies', 'شوكو براونيز', 12],
    ['Cookies', 'كوكيز شوكولاتة بلجيكية', 12],
    ['Cookies Pudding', 'بودينغ كوكيز', 17],
  ] },
];
