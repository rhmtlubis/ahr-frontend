const companyProfileContentByLocale = {
  id: {
    about:
      'AHR PRINTING adalah spesialis jersey custom di Katapang, Bandung, untuk tim, komunitas, sekolah, event, dan kebutuhan personal.',
    history:
      'Sejak 2020, AHR PRINTING tumbuh dari fondasi komitmen, integritas, dan konsistensi dalam layanan cetak jersey.',
    commitment:
      'Kami fokus pada hasil cetak yang rapi, proses yang jelas, dan pelayanan yang responsif agar pelanggan nyaman dari awal sampai pesanan selesai.',
    reasons: [
      {
        title: 'Terpercaya',
        detail:
          'Sejak berdiri pada tahun 2020, AHR PRINTING tumbuh dengan reputasi yang dibangun dari kejujuran, tanggung jawab, kualitas hasil cetak, dan ketepatan waktu pengerjaan.',
      },
      {
        title: 'Responsif',
        detail:
          'Tim kami siap merespons kebutuhan pelanggan dengan cepat, memberi solusi yang sesuai, dan memastikan setiap proses pemesanan berjalan lancar dari awal sampai selesai.',
      },
      {
        title: 'Service Excellent',
        detail:
          'Kami menghadirkan pelayanan yang ramah, profesional, dan berorientasi pada kepuasan sehingga hubungan jangka panjang dengan pelanggan dapat terjaga dengan baik.',
      },
    ],
    vision:
      'Menciptakan jersey berkualitas tinggi, terpercaya dengan kualitas terbaik dan pelayanan unggul.',
    missions: [
      'Memberikan jersey berkualitas tinggi dengan standar cetak terbaik.',
      'Menyediakan desain yang kreatif dan inovatif.',
      'Menjaga ketepatan waktu dalam setiap proses produksi.',
      'Menjalin hubungan jangka panjang dengan pelanggan melalui layanan profesional.',
    ],
    address: {
      label: 'Workshop & Kantor AHR Printing',
      line: 'Jl. Bojong Tanjung No.19, RW.005, Sangkanhurip, Kec. Katapang, Kabupaten Bandung, Jawa Barat 40921',
      mapUrl: 'https://maps.app.goo.gl/68jDN3VNQZbLxG4o6',
    },
  },
  en: {
    about:
      'AHR PRINTING is a custom jersey specialist in Katapang, Bandung, serving teams, communities, schools, events, and personal orders.',
    history:
      'Since 2020, AHR PRINTING has grown on a foundation of commitment, integrity, and consistency in jersey printing services.',
    commitment:
      'We focus on neat print results, a clear process, and responsive service so customers feel comfortable from the beginning until the order is completed.',
    reasons: [
      {
        title: 'Trusted',
        detail:
          'Since its founding in 2020, AHR PRINTING has grown through a reputation built on honesty, responsibility, print quality, and on-time delivery.',
      },
      {
        title: 'Responsive',
        detail:
          'Our team responds quickly to customer needs, offers suitable solutions, and keeps each ordering process running smoothly from start to finish.',
      },
      {
        title: 'Excellent Service',
        detail:
          'We provide friendly, professional, and satisfaction-focused service so long-term relationships with customers can be maintained well.',
      },
    ],
    vision:
      'To create high-quality jerseys with trusted workmanship, the best quality, and excellent service.',
    missions: [
      'Deliver high-quality jerseys with the best printing standards.',
      'Provide creative and innovative designs.',
      'Maintain timeliness in every production process.',
      'Build long-term relationships with customers through professional service.',
    ],
    address: {
      label: 'AHR Printing Workshop & Office',
      line: 'Jl. Bojong Tanjung No.19, RW.005, Sangkanhurip, Katapang, Bandung Regency, West Java 40921',
      mapUrl: 'https://maps.app.goo.gl/68jDN3VNQZbLxG4o6',
    },
  },
}

export function getCompanyProfileContent(locale = 'id') {
  return companyProfileContentByLocale[locale] || companyProfileContentByLocale.id
}

export const companyProfileContent = companyProfileContentByLocale.id
