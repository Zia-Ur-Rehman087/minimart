document.addEventListener('DOMContentLoaded', function () {
            const menuToggle = document.getElementById('menu-toggle');
            const mobileMenu = document.getElementById('mobile-menu');
            const navItems = document.getElementById('nav-items');

            // Clone desktop nav items for mobile menu
            const itemsForMobile = navItems.cloneNode(true);
            itemsForMobile.classList.remove('hidden', 'sm:flex', 'ml-2', 'space-x-0');
            itemsForMobile.classList.add('flex', 'flex-col', 'space-y-2', 'p-2');

            // Convert divs to links for better mobile UX
            Array.from(itemsForMobile.children).forEach(item => {
                item.classList.remove('flex', 'cursor-pointer', 'items-center', 'gap-x-1', 'rounded-md', 'py-2', 'px-4', 'hover:bg-gray-100');
                item.classList.add('w-full');

                const link = document.createElement('a');
                link.href = '#';
                link.className = 'flex items-center gap-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded';

                // Move all child elements into the new link
                while (item.firstChild) {
                    link.appendChild(item.firstChild);
                }

                item.appendChild(link);
            });

            mobileMenu.appendChild(itemsForMobile);

            // Toggle mobile menu
            menuToggle.addEventListener('click', function (e) {
                e.stopPropagation();
                mobileMenu.classList.toggle('hidden');
            });

            // Close menu when clicking outside
            document.addEventListener('click', function () {
                mobileMenu.classList.add('hidden');
            });

            // Prevent menu from closing when clicking inside it
            mobileMenu.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        });