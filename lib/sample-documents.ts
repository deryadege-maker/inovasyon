export interface SampleDocumentSet {
  id: string;
  title: string;
  category: string;
  description: string;
  documents: {
    id: string;
    label: string;
    title: string;
    content: string;
  }[];
  suggestedQuestions: string[];
}

export const SAMPLE_DOCUMENT_SETS: SampleDocumentSet[] = [
  {
    id: "telgraf-1919",
    title: "1919 Telgraf Ağı: İletişimde Kurtuluş İnovasyonu",
    category: "Haberleşme & Süreç İnovasyonu",
    description: "Milli Mücadele'nin başlangıcında telgraf hatlarının stratejik kullanımı, şifreli haberleşme ve halkı birleştirme süreci.",
    documents: [
      {
        id: "belge-1",
        label: "Belge 1",
        title: "Havza ve Amasya Genelgeleri Dönemi Telgraf Genelgesi (Haziran 1919)",
        content: `Mustafa Kemal Paşa telgraf memurlarına gönderdiği gizli talimatta şöyle bildirmiştir: "Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır. Telgraf merkezleri hiçbir koşulda işgal güçlerine teslim edilmeyecek, haberleşme kesintisiz sürdürülecektir." Telgraf memurları, şifre anahtarlarını gizleyerek Anadolu'daki tüm milli cemiyetler arasında bir inovasyon olarak anlık koordinasyon hattı kurmuştur.`
      },
      {
        id: "belge-2",
        label: "Belge 2",
        title: "Telgrafçı Hamdi Bey'in İstanbul Muhaberesi Kayıtları (16 Mart 1920)",
        content: `Manastırlı Hamdi Bey, İngiliz askerlerinin İstanbul Postahanesi'ni bastığı dakikalarda Ankara'daki Mustafa Kemal Paşa'ya son ana kadar telgraf çekmiş ve şu sözleri kaydetmiştir: "Şimdi Harbiye Nezareti işgal edildi, teller kesiliyor, Paşam telgraf başında bekleyiniz." Bu teknik iletişim cesareti sayesinde Ankara, işgali tüm yurda anında duyurma imkânı bulmuştur.`
      },
      {
        id: "belge-3",
        label: "Belge 3",
        title: "Anadolu Ajansı ve Telsiz-Telgraf Şebekesi Raporu (1920)",
        content: `Yunus Nadi ve Halide Edip'in girişimleriyle kurulan haberleşme teşkilatında, telgraf mors alfabesi ve ilkel radyo-telsiz istasyonları birleştirilmiştir. Raporda, "Günde 50'den fazla şifreli resmi tebligatın Anadolu içlerine ulaştırıldığı, bunun bağımsızlık hareketine teknik bir can damarı sağladığı" kaydedilmiştir.`
      }
    ],
    suggestedQuestions: [
      "Mustafa Kemal Paşa telgraf memurlarına gönderdiği talimatta ne söylemiştir?",
      "Manastırlı Hamdi Bey son ana kadar ne bildirmiştir?",
      "Anadolu Ajansı haberleşme teşkilatında hangi teknik araçlar birleştirilmiştir?",
      "Mustafa Kemal Paşa Samsun'a hangi gemiyle çıktı? (Belgelerde olmayan kontrol sorusu)"
    ]
  },
  {
    id: "demiryolu-imalat",
    title: "Demiryolu ve İmalat-ı Harbiye: Lojistik Devrimi",
    category: "Ulaşım & Ürün İnovasyonu",
    description: "Kurtuluş Savaşı ve sonrasında demir rayların tamiri, yerli mühimmat modifikasyonu ve lojistik sistem inovasyonu.",
    documents: [
      {
        id: "belge-1",
        label: "Belge 1",
        title: "Eskişehir-Ankara Demiryolu Islah Raporu (1921)",
        content: `Demiryolu mühendisi Behiç Bey (Erkin), lokomotiflerin yakıt ihtiyacı için linyit kömürü ve odun karışımını özel fırın ızgaralarıyla modifiye ettirmiştir. Raporda: "Lokomotiflerimiz düşman işgalinden kurtarılan her karış demir ray üzerinde aralıksız cephane taşımaya hazır hale getirilmiştir" ifadesi yer almaktadır.`
      },
      {
        id: "belge-2",
        label: "Belge 2",
        title: "Ankara İmalat-ı Harbiye Atölyeleri Günlüğü (1921)",
        content: `Mühendis Şakir Zümre ve ustabaşılar, işe yaramaz görülen hurda mermileri ve ray parçalarını eriterek yeni top kamaları ve süngüler imal etmiştir. Baş usta günlükte şunu kaydetmiştir: "Eski İngiliz mermilerinin çaplarını tornada küçülterek kendi tüfeklerimize uygun kıldık; imkânsızlık bize yeni teknikler buldurdu."`
      }
    ],
    suggestedQuestions: [
      "Behiç Bey lokomotiflerin çalışması için hangi teknik çözümü uygulamıştır?",
      "İmalat-ı Harbiye atölyelerinde hurda parçalar nasıl değerlendirilmiştir?",
      "Baş usta mermiler hakkında tam olarak ne demiştir?",
      "Behiç Bey hangi üniversiteden mezun oldu? (Belgede yok kuralı testi)"
    ]
  },
  {
    id: "havacilik-vecihi",
    title: "Göklerde İnovasyon: Tayyarecilik ve Yerli Uçak Üretimi",
    category: "Havacılık & Teknoloji İnovasyonu",
    description: "Vecihi Hürkuş ve Türk havacılık öncülerinin hurda parçalardan ilk milli uçağı üretme ve test etme mücadelesi.",
    documents: [
      {
        id: "belge-1",
        label: "Belge 1",
        title: "Vecihi K-VI Uçağı Üretim Raporu (İzmir Seydiköy, 1924)",
        content: `Vecihi Hürkuş, Kurtuluş Savaşı'ndan kalan ganimet uçak motorunu kullanarak ahşap gövdeli ilk yerli tayyare olan Vecihi K-VI'yı tasarlamıştır. Tasarım notlarında: "Kanat kaplamalarında yerli pamuklu bez ve özel tutkallı solüsyon kullanılarak gövde hafifliği azamiye indirilmiştir" denilmektedir.`
      },
      {
        id: "belge-2",
        label: "Belge 2",
        title: "Hava Kuvvetleri Heyeti Uçuş Testi Tutanağı (28 Ocak 1925)",
        content: `İzmir semalarında gerçekleştirilen ilk test uçuşunda Vecihi Bey uçağı 15 dakika başarıyla uçurmuş ve yere indirmiştir. Heyet başkanı tutanakta: "Tayyarenin aerodinamik dengesi mükemmeldir; ancak memlekette uçuş sertifikası verecek yetkili bir fennî heyet bulunmadığından resmi izin verilememiştir" değerlendirmesini yapmıştır.`
      }
    ],
    suggestedQuestions: [
      "Vecihi Hürkuş kanat kaplamasında hangi malzemeleri kullanmıştır?",
      "Heyet başkanı tutanakta uçak hakkında tam olarak ne demiştir?",
      "İlk test uçuşu ne kadar sürmüştür?",
      "Vecihi Hürkuş daha sonra hangi fabrikayı kurdu? (Belgelerde olmayan soru)"
    ]
  }
];
