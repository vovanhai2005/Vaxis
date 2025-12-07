import React, { forwardRef } from 'react'

const VaccinationCertificateTemplate = forwardRef(({ userProfile, vaccine }, ref) => {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  // Using only inline styles to avoid Tailwind's oklch color functions
  const styles = {
    container: {
      position: 'absolute',
      left: '-9999px',
      top: 0,
      backgroundColor: '#ffffff',
      color: '#000000',
      padding: '40px',
      width: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      fontFamily: 'serif'
    },
    border: {
      border: '4px double #1f2937',
      height: '100%',
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    title: {
      fontWeight: 'bold',
      fontSize: '14px',
      textTransform: 'uppercase',
      marginBottom: '4px'
    },
    subtitle: {
      fontWeight: 'bold',
      fontSize: '14px',
      textDecoration: 'underline',
      marginBottom: '24px'
    },
    ministry: {
      fontWeight: 'bold',
      fontSize: '12px',
      textTransform: 'uppercase'
    },
    mainTitle: {
      fontWeight: 'bold',
      fontSize: '24px',
      textTransform: 'uppercase',
      color: '#dc2626',
      marginBottom: '8px'
    },
    englishTitle: {
      fontStyle: 'italic',
      fontSize: '14px'
    },
    sectionTitle: {
      fontWeight: 'bold',
      fontSize: '18px',
      textTransform: 'uppercase',
      borderBottom: '1px solid #d1d5db',
      paddingBottom: '8px',
      marginBottom: '16px'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px 32px',
      fontSize: '14px'
    },
    infoRow: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '8px'
    },
    infoLabel: {
      fontWeight: 'bold',
      minWidth: '120px'
    },
    infoValue: {
      flex: 1,
      borderBottom: '1px dotted #9ca3af'
    },
    fullWidth: {
      gridColumn: 'span 2'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px'
    },
    th: {
      border: '1px solid #1f2937',
      padding: '8px',
      backgroundColor: '#f3f4f6',
      textAlign: 'left'
    },
    thCenter: {
      border: '1px solid #1f2937',
      padding: '8px',
      backgroundColor: '#f3f4f6',
      textAlign: 'center'
    },
    td: {
      border: '1px solid #1f2937',
      padding: '8px'
    },
    tdCenter: {
      border: '1px solid #1f2937',
      padding: '8px',
      textAlign: 'center'
    },
    footer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '32px',
      marginTop: '32px'
    },
    signatureSection: {
      textAlign: 'center'
    },
    stamp: {
      fontWeight: 'bold',
      color: '#dc2626',
      border: '2px solid #dc2626',
      borderRadius: '50px',
      padding: '8px 16px',
      display: 'inline-block',
      transform: 'rotate(-12deg)',
      opacity: 0.8
    },
    disclaimer: {
      textAlign: 'center',
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#6b7280',
      marginTop: '32px'
    }
  }

  return (
    <div ref={ref} style={styles.container}>
      <div style={styles.border}>
        
        {/* Header */}
        <div style={styles.header}>
          <h4 style={styles.title}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
          <p style={styles.subtitle}>Độc lập - Tự do - Hạnh phúc</p>
          
          <div style={{ marginBottom: '16px' }}>
            <p style={styles.ministry}>BỘ Y TẾ</p>
            <p style={styles.ministry}>TRUNG TÂM TIÊM CHỦNG VAXIS</p>
          </div>

          <h1 style={styles.mainTitle}>CHỨNG NHẬN TIÊM CHỦNG</h1>
          <p style={styles.englishTitle}>(CERTIFICATE OF VACCINATION)</p>
        </div>

        {/* User Info */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={styles.sectionTitle}>I. THÔNG TIN CÁ NHÂN (PERSONAL INFORMATION)</h3>
          <div style={styles.infoGrid}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Họ và tên:</span>
              <span style={{ ...styles.infoValue, textTransform: 'uppercase' }}>{userProfile?.full_name}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Ngày sinh:</span>
              <span style={styles.infoValue}>{formatDate(userProfile?.dob)}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Giới tính:</span>
              <span style={styles.infoValue}>{userProfile?.gender}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Số CMND/CCCD:</span>
              <span style={styles.infoValue}>{userProfile?.national_id}</span>
            </div>
            <div style={{ ...styles.infoRow, ...styles.fullWidth }}>
              <span style={styles.infoLabel}>Địa chỉ:</span>
              <span style={styles.infoValue}>{userProfile?.address}</span>
            </div>
          </div>
        </div>

        {/* Vaccination Details Table */}
        <div style={{ marginBottom: '32px', flex: 1 }}>
          <h3 style={styles.sectionTitle}>II. CHI TIẾT MŨI TIÊM (VACCINATION DETAILS)</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.thCenter, width: '50px' }}>Mũi</th>
                <th style={styles.th}>Tên vắc xin (Vaccine)</th>
                <th style={styles.thCenter}>Ngày tiêm (Date)</th>
                <th style={styles.th}>Nhà sản xuất (Manufacturer)</th>
                <th style={styles.th}>Đơn vị tiêm (Site)</th>
              </tr>
            </thead>
            <tbody>
              {vaccine ? (
                <tr>
                  <td style={{ ...styles.tdCenter, fontWeight: 'bold' }}>{vaccine.dose_number || 1}</td>
                  <td style={{ ...styles.td, fontWeight: '600' }}>{vaccine.vaccine_name}</td>
                  <td style={styles.tdCenter}>{formatDate(vaccine.administered_at)}</td>
                  <td style={styles.td}>{vaccine.manufacturer}</td>
                  <td style={styles.td}>{vaccine.location || 'Trung tâm Vaxis'}</td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="5" style={{ ...styles.td, textAlign: 'center', fontStyle: 'italic', padding: '16px' }}>
                    Chưa có dữ liệu tiêm chủng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Signature */}
        <div style={styles.footer}>
          <div></div>
          <div style={styles.signatureSection}>
            <p style={{ fontStyle: 'italic', fontSize: '14px', marginBottom: '4px' }}>
              Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
            </p>
            <p style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px' }}>
              XÁC NHẬN CỦA ĐƠN VỊ TIÊM CHỦNG
            </p>
            <p style={{ fontStyle: 'italic', fontSize: '12px', marginBottom: '48px' }}>(Ký, đóng dấu)</p>
            
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <p style={styles.stamp}>
                ĐÃ KÝ DUYỆT
                <br/>
                <span style={{ fontSize: '10px' }}>VAXIS CENTER</span>
              </p>
            </div>
            <p style={{ fontWeight: 'bold', marginTop: '16px' }}>GIÁM ĐỐC TRUNG TÂM</p>
          </div>
        </div>

        <div style={styles.disclaimer}>
          * Chứng nhận này có giá trị chứng minh lịch sử tiêm chủng của người dân.
        </div>
      </div>
    </div>
  )
})

export default VaccinationCertificateTemplate
