// frontend/src/utils/qcDistricts.ts

export interface DistrictBarangayMapping {
  district: string;
  name: string;
  barangays: string[];
}

export const QC_DISTRICTS_DATA: DistrictBarangayMapping[] = [
  {
    district: 'District 1',
    name: 'District 1 (37 Barangays)',
    barangays: [
      'Alicia',
      'Bagong Pag-asa',
      'Bahay Toro',
      'Balingasa',
      'Bungad',
      'Damar',
      'Damayan',
      'Del Monte',
      'Katipunan',
      'Lourdes',
      'Maharlika',
      'Mariblo',
      'Masambong',
      'N.S. Amoranto (Gintong Silahis)',
      'Nayong Kanluran',
      'Paang Bundok',
      'Pag-ibig sa Nayon',
      'Paltok',
      'Paraiso',
      'Phil-Am',
      'Project 6',
      'Ramon Magsaysay',
      'Saint Peter',
      'Salvacion',
      'San Antonio',
      'San Isidro Labrador',
      'San Jose',
      'Santa Cruz',
      'Santa Teresita',
      'Santo Cristo (Sto. Cristo)',
      'Santo Domingo (Matalahib)',
      'Siena',
      'Talayan',
      'Vasra',
      'Veterans Village',
      'West Triangle',
    ],
  },
  {
    district: 'District 2',
    name: 'District 2 (5 Barangays)',
    barangays: [
      'Bagong Silangan',
      'Batasan Hills',
      'Commonwealth',
      'Holy Spirit',
      'Payatas',
    ],
  },
  {
    district: 'District 3',
    name: 'District 3 (33 Barangays)',
    barangays: [
      'Amihan',
      'Bagumbayan',
      'Bagumbuhay',
      'Bayanihan',
      'Blue Ridge A',
      'Blue Ridge B',
      'Camp Aguinaldo',
      'Claro (Quirino 2-B)',
      'Dioquino Zobel',
      'Duyan-duyan',
      'E. Rodriguez',
      'East Kamias',
      'Escopa I',
      'Escopa II',
      'Escopa III',
      'Escopa IV',
      'Libis',
      'Loyola Heights',
      'Mangga',
      'Marilag',
      'Masagana',
      'Matandang Balara',
      'Milagrosa',
      'Pansol',
      'Quirino 2-A',
      'St. Ignatius',
      'San Roque',
      'Silangan',
      'Socorro',
      'Tagumpay',
      'Ugong Norte',
      'Villa Maria Clara',
      'West Kamias',
    ],
  },
  {
    district: 'District 4',
    name: 'District 4 (38 Barangays)',
    barangays: [
      'Bagong Lipunan ng Crame',
      'Botocan',
      'Central',
      'Damayang Lagi',
      'Don Manuel / Don Miguel',
      'Doña Aurora',
      'Doña Imelda',
      'Doña Josefa',
      'Horseshoe',
      'Immaculate Concepcion',
      'Kalusugan',
      'Kamuning',
      'Kaunlaran',
      'Kristong Hari',
      'Krus na Ligtas',
      'Laging Handa',
      'Malaya',
      'Mariana',
      'Obrero',
      'Old Capitol Site',
      'Paligsahan',
      'Pinagkaisahan',
      'Pinyahan',
      'Roxas',
      'Sacred Heart',
      'San Isidro Galas',
      'San Martin de Porres',
      'San Vicente',
      'Santol',
      'Sikatuna Village',
      'South Triangle',
      'Santo Niño',
      'Tatalon',
      'Teacher\'s Village East',
      'Teacher\'s Village West',
      'U.P. Campus',
      'U.P. Village',
      'Valencia',
    ],
  },
  {
    district: 'District 5',
    name: 'District 5 (14 Barangays)',
    barangays: [
      'Bagbag',
      'Capri',
      'Fairview',
      'Gulod',
      'Greater Lagro',
      'Kaligayahan',
      'Nagkaisang Nayon',
      'North Fairview',
      'Novaliches Proper',
      'Pasong Putik Proper',
      'San Agustin',
      'San Bartolome',
      'Sta. Lucia',
      'Sta. Monica',
    ],
  },
  {
    district: 'District 6',
    name: 'District 6 (11 Barangays)',
    barangays: [
      'Apolonio Samson',
      'Baesa',
      'Balon Bato',
      'Culiat',
      'New Era',
      'Pasong Tamo',
      'Sangandaan',
      'Sauyo',
      'Talipapa',
      'Tandang Sora',
      'Unang Sigaw',
    ],
  },
];

export const ALL_QC_DISTRICT_NAMES: string[] = QC_DISTRICTS_DATA.map((d) => d.district);

export function getBarangaysByDistrict(district?: string | null): string[] {
  if (!district) return [];
  const cleanDistrict = district.trim().toLowerCase();
  const match = QC_DISTRICTS_DATA.find(
    (d) =>
      d.district.toLowerCase() === cleanDistrict ||
      cleanDistrict.includes(d.district.toLowerCase())
  );
  return match ? match.barangays : [];
}

export function getDistrictByBarangay(barangay?: string | null): string | null {
  if (!barangay) return null;
  const cleanBgy = barangay.trim().toLowerCase();
  for (const group of QC_DISTRICTS_DATA) {
    const found = group.barangays.some(
      (b) => b.toLowerCase() === cleanBgy || cleanBgy.includes(b.toLowerCase()) || b.toLowerCase().includes(cleanBgy)
    );
    if (found) {
      return group.district;
    }
  }
  return null;
}
