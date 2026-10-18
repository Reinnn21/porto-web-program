/* ==========================================================
   script-simple.js: khusus halaman biodata (index.html)
   3 animasi: 1) Scroll reveal  2) Tilt saat hover  3) Ripple tombol
   + Diagram pie "Komposisi Keahlian" (di bagian paling bawah)
   ========================================================== */

// Kalau pengunjung mematikan animasi di perangkatnya, berhenti di sini.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

  /* ---------- CSS untuk animasi (dipasang otomatis) ---------- */
  const style = document.createElement('style');
  style.textContent = `
    /* Keadaan awal: tersembunyi dan agak turun */
    .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
    /* Keadaan akhir: terlihat di posisi normal */
    .reveal.visible { opacity: 1; transform: none; }

    /* Tombol perlu ini supaya ripple tidak keluar dari tombol */
    button[type="submit"] { position: relative; overflow: hidden; }

    /* Lingkaran ripple yang melebar lalu hilang */
    .ripple {
      position: absolute; border-radius: 50%; background: currentColor;
      opacity: 0.25; transform: scale(0); pointer-events: none;
      animation: ripple 0.6s ease-out forwards;
    }
    @keyframes ripple { to { transform: scale(1); opacity: 0; } }
  `;
  document.head.appendChild(style);


  /* ==========================================================
     1) SCROLL REVEAL: bagian halaman muncul saat di-scroll
     ========================================================== */
  // Elemen yang dianimasikan: header, semua section, tabel biodata, footer
  const revealElements = document.querySelectorAll('header, section, .biodata-table, footer');

  // Beri semua elemen itu keadaan awal "tersembunyi"
  revealElements.forEach(function (el) {
    el.classList.add('reveal');
  });

  // IntersectionObserver = pengamat yang memberi tahu saat elemen masuk layar
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');   // munculkan
        observer.unobserve(entry.target);        // cukup sekali, jangan diulang

        // Setelah animasi selesai (0,8 detik), lepas class supaya
        // efek hover bawaan CSS-mu (section naik sedikit) bisa jalan lagi
        setTimeout(function () {
          entry.target.classList.remove('reveal', 'visible');
        }, 800);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(function (el) {
    observer.observe(el);
  });


  /* ==========================================================
     2) TILT: foto profil dan tabel biodata miring 3D
        mengikuti kursor mouse
     ========================================================== */
  const tiltElements = document.querySelectorAll('.profile-photo, .biodata-table');

  tiltElements.forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      if (el.classList.contains('reveal')) return; // tunggu animasi muncul selesai

      const kotak = el.getBoundingClientRect();
      // Posisi kursor di dalam elemen: -0.5 (kiri/atas) sampai 0.5 (kanan/bawah)
      const x = (e.clientX - kotak.left) / kotak.width - 0.5;
      const y = (e.clientY - kotak.top) / kotak.height - 0.5;

      el.style.transition = 'transform 0.1s ease-out';
      el.style.transform =
        'perspective(800px) rotateX(' + (-y * 8) + 'deg) rotateY(' + (x * 8) + 'deg)';
    });

    // Saat kursor pergi, kembalikan ke posisi semula
    el.addEventListener('mouseleave', function () {
      el.style.transition = '';
      el.style.transform = '';
    });
  });


  /* ==========================================================
     3) RIPPLE: gelombang muncul dari titik klik di tombol
        "Kirim Pesan"
     ========================================================== */
  const tombol = document.querySelector('button[type="submit"]');

  tombol.addEventListener('click', function (e) {
    const kotak = tombol.getBoundingClientRect();
    const ukuran = Math.max(kotak.width, kotak.height) * 2;

    // Buat lingkaran kecil di titik klik
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = ukuran + 'px';
    ripple.style.left = (e.clientX - kotak.left - ukuran / 2) + 'px';
    ripple.style.top = (e.clientY - kotak.top - ukuran / 2) + 'px';
    tombol.appendChild(ripple);

    // Hapus lingkarannya setelah animasi selesai
    setTimeout(function () {
      ripple.remove();
    }, 600);
  });

}


/* ==========================================================
   4) PIE CHART: diagram "Komposisi Keahlian"
      Cukup ubah isi daftar DATA di bawah ini (nama, nilai, warna).
      Nilai tidak harus berjumlah 100; persentase dihitung otomatis.
   ========================================================== */
(function () {
  const DATA = [
    { nama: 'Valorant',nilai: 30, warna: '#312e81' },
    { nama: 'Dead by Daylight',nilai: 25, warna: '#f59e0b' },
    { nama: 'Persona',  nilai: 20, warna: '#6366f1' },
    { nama: 'Counter-strike 2',nilai: 15, warna: '#7c3aed' },
    { nama: 'Minecraft',  nilai: 10, warna: '#fcd34d' }
  ];

  const pie = document.getElementById('pie-chart');
  const legend = document.getElementById('pie-legend');
  if (!pie || !legend) return;

  const total = DATA.reduce(function (jumlah, d) { return jumlah + d.nilai; }, 0);

  // Susun conic-gradient: setiap irisan = rentang derajat tertentu
  let mulai = 0;
  const bagian = [];
  DATA.forEach(function (d) {
    const persen = (d.nilai / total) * 100;
    const akhir = mulai + persen;
    bagian.push(d.warna + ' ' + mulai + '% ' + akhir + '%');
    mulai = akhir;

    // Baris legenda
    const li = document.createElement('li');
    const kotak = document.createElement('span');
    kotak.className = 'pie-swatch';
    kotak.style.backgroundColor = d.warna;
    li.appendChild(kotak);
    li.appendChild(document.createTextNode(d.nama + ': ' + Math.round(persen) + '%'));
    legend.appendChild(li);
  });

  pie.style.background = 'conic-gradient(' + bagian.join(', ') + ')';
  pie.setAttribute('aria-label',
    'Diagram pie komposisi keahlian: ' +
    DATA.map(function (d) { return d.nama + ' ' + Math.round(d.nilai / total * 100) + '%'; }).join(', '));
})();