<template>
  <header>
    <div class="container">
      <div class="logo">Suleiman Msaba</div>

      <div class="burger" @click="toggleNav">☰</div>

      <nav class="nav" :class="{ show: navOpen }">
        <a href="/50/input.html">Research</a>
        <a href="#">Product</a>

        <div class="dropdown" :class="{ open: dropdownOpen }">
          <button @click="toggleDropdown">Features ▾</button>
          <div class="menu">
            <a href="#">Agents</a>
            <a href="#">Voice</a>
            <a href="#">Image generation</a>
            <a href="#">Study mode</a>
          </div>
        </div>

        <a href="#">Safety</a>
        <a href="#">Company</a>
      </nav>

      <div class="actions">
        <button class="btn">Log in</button>
        <button class="btn signup">Sign up</button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "NavigationBar",
  data() {
    return {
      navOpen: false,
      dropdownOpen: false
    };
  },
  methods: {
    toggleNav() {
      this.navOpen = !this.navOpen;
    },
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    }
  }
};
</script>

<style scoped>
:root {
  --bg: rgba(255,255,255,0.8);
  --border: #e5e7eb;
  --text: #0f172a;
  --muted: #6b7280;
  --hover: #f3f4f6;
  --button: #000;
}

header {
  position: sticky;
  top: 0;
  backdrop-filter: blur(12px);
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  z-index: 1000;
}

.container {
  max-width: 1200px;
  margin: auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo { font-weight: 600; font-size: 18px; }

.nav { display: flex; gap: 22px; align-items: center; }

.nav a, .dropdown button {
  text-decoration: none;
  color: var(--text);
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 10px;
  background: none;
  border: none;
  cursor: pointer;
}

.nav a:hover, .dropdown button:hover { background: var(--hover); }

.dropdown { position: relative; }

.menu {
  position: absolute;
  top: 130%;
  left: 0;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 14px;
  min-width: 200px;
  box-shadow: 0 20px 50px rgba(0,0,0,.08);
  padding: 8px;
  display: none;
}

.menu a {
  display: block;
  padding: 10px;
  border-radius: 10px;
}

.menu a:hover { background: var(--hover); }

.dropdown.open .menu { display: block; }

.actions { display: flex; gap: 10px; }

.btn {
  font-size: 14px;
  padding: 8px 14px;
  border-radius: 12px;
  cursor: pointer;
  border: none;
}

.signup { background: var(--button); color: #fff; }

.burger { display: none; font-size: 22px; cursor: pointer; }

@media(max-width: 768px) {
  .nav {
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    flex-direction: column;
    background: white;
    padding: 20px;
    border-bottom: 1px solid var(--border);
    display: none;
  }
  .nav.show { display: flex; }
  .burger { display: block; }
}
</style>
