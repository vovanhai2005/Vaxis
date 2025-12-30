import React, { forwardRef } from 'react'

const VaccinationCertificateTemplate = forwardRef(({ userProfile, appointment }, ref) => {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // Using only inline styles to avoid Tailwind's oklch color functions
  // Styles are designed for A4 paper size (210mm x 297mm)
  const styles = {
    container: {
      position: 'absolute',
      left: '-9999px', // Hide from screen
      top: 0,
      backgroundColor: '#ffffff',
      color: '#000000',
      padding: '40px',
      width: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif' // Clean sans-serif for main text
    },
    outerBorder: {
      border: '3px solid #0d9488', // Teal-600
      height: '100%',
      padding: '8px'
    },
    innerBorder: {
      border: '1px solid #0d9488',
      height: '100%',
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff'
    },
    headerTop: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 1fr',
      gap: '16px',
      alignItems: 'center',
      marginBottom: '24px',
      borderBottom: '2px solid #0d9488',
      paddingBottom: '16px'
    },
    logoSection: {
      textAlign: 'center'
    },
    logo: {
      width: '80px',
      height: '80px',
      backgroundColor: '#0d9488',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: '32px'
    },
    centerInfo: {
      textAlign: 'center'
    },
    ministryHeader: {
      fontWeight: 'bold',
      fontSize: '11px',
      textTransform: 'uppercase',
      marginBottom: '2px',
      lineHeight: '1.3',
      margin: 0
    },
    qrSection: {
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    },
    qrPlaceholder: {
      width: '80px',
      height: '80px',
      border: '2px solid #0d9488',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      color: '#6b7280'
    },
    sectionTitle: {
      fontWeight: 'bold',
      fontSize: '14px',
      textTransform: 'uppercase',
      backgroundColor: '#f0fdfa', // Teal-50
      color: '#0d9488',
      padding: '10px 16px',
      marginBottom: '16px',
      borderLeft: '4px solid #0d9488',
      marginTop: 0
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px 24px',
      fontSize: '13px',
      lineHeight: '1.8'
    },
    infoRow: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '8px'
    },
    infoLabel: {
      fontWeight: '600',
      minWidth: '110px',
      color: '#374151'
    },
    infoValue: {
      flex: 1,
      borderBottom: '1px dotted #9ca3af',
      paddingBottom: '2px',
      color: '#000000'
    },
    fullWidth: {
      gridColumn: 'span 2'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '12px',
      marginTop: '8px'
    },
    th: {
      border: '1px solid #0d9488',
      padding: '10px 8px',
      backgroundColor: '#f0fdfa',
      color: '#0d9488',
      fontWeight: 'bold',
      textAlign: 'left'
    },
    thCenter: {
      border: '1px solid #0d9488',
      padding: '10px 8px',
      backgroundColor: '#f0fdfa',
      color: '#0d9488',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    td: {
      border: '1px solid #d1d5db',
      padding: '10px 8px',
      lineHeight: '1.5'
    },
    tdCenter: {
      border: '1px solid #d1d5db',
      padding: '10px 8px',
      textAlign: 'center',
      lineHeight: '1.5'
    },
    footer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '48px',
      marginTop: '40px',
      fontSize: '13px'
    },
    signatureSection: {
      textAlign: 'center'
    },
    stamp: {
      fontWeight: 'bold',
      color: '#0d9488',
      border: '3px solid #0d9488',
      borderRadius: '50%',
      width: '120px',
      height: '120px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      transform: 'rotate(-15deg)',
      opacity: 0.7,
      fontSize: '14px',
      lineHeight: '1.4'
    },
    disclaimer: {
      textAlign: 'center',
      fontSize: '11px',
      fontStyle: 'italic',
      color: '#6b7280',
      marginTop: '32px',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb'
    },
    notes: {
      fontSize: '11px',
      color: '#374151',
      lineHeight: '1.6',
      marginTop: '20px',
      padding: '12px',
      backgroundColor: '#f9fafb',
      borderRadius: '4px'
    }
  }

  return (
    <div ref={ref} style={styles.container}>
      <div style={styles.outerBorder}>
        <div style={styles.innerBorder}>
          
          {/* Header with Logo and QR */}
          <div style={styles.headerTop}>
            <div style={styles.logoSection}>
              <div style={styles.logo}>V</div>
              <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '4px', color: '#0d9488' }}>VAXIS</div>
            </div>
            
            <div style={styles.centerInfo}>
              <p style={styles.ministryHeader}>BỘ Y TẾ</p>
              <p style={styles.ministryHeader}>CỤC Y TẾ DỰ PHÒNG</p>
              <p style={{ ...styles.ministryHeader, fontSize: '13px', marginTop: '8px' }}>TRUNG TÂM TIÊM CHỦNG VAXIS</p>
              <p style={{ fontSize: '10px', marginTop: '4px', margin: 0 }}>
                <span style={{ fontWeight: '600' }}>Địa chỉ:</span> 268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM
              </p>
            </div>

            <div style={styles.qrSection}>
                <div style={styles.qrPlaceholder}>QR CODE</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ 
                fontWeight: 'bold', 
                fontSize: '28px', 
                textTransform: 'uppercase', 
                color: '#0d9488', 
                marginBottom: '8px', 
                letterSpacing: '1px' 
            }}>
                CHỨNG NHẬN TIÊM CHỦNG
            </h1>
            <p style={{ fontStyle: 'italic', fontSize: '16px', color: '#374151', fontWeight: '500' }}>
                (CERTIFICATE OF VACCINATION)
            </p>
            {appointment && appointment.id && (
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px', fontWeight: '600' }}>
                Appointment #{appointment.id}
              </p>
            )}
          </div>

          {/* User Info */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={styles.sectionTitle}>I. THÔNG TIN NGƯỜI ĐƯỢC TIÊM (Recipient Information)</h3>
            <div style={styles.infoGrid}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Họ và tên:</span>
                <span style={{ ...styles.infoValue, textTransform: 'uppercase', fontWeight: '600' }}>{userProfile?.full_name}</span>
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
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Số điện thoại:</span>
                <span style={styles.infoValue}>{userProfile?.phone || 'Chưa cập nhật'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Email:</span>
                <span style={styles.infoValue}>{userProfile?.email || 'Chưa cập nhật'}</span>
              </div>
              <div style={{ ...styles.infoRow, ...styles.fullWidth }}>
                <span style={styles.infoLabel}>Địa chỉ liên hệ:</span>
                <span style={styles.infoValue}>{userProfile?.address}</span>
              </div>
            </div>
          </div>

          {/* Vaccination Details Table */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={styles.sectionTitle}>II. THÔNG TIN TIÊM CHỦNG (Vaccination Information)</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.thCenter, width: '50px' }}>STT<br/>(No.)</th>
                  <th style={{ ...styles.th, width: '28%' }}>Tên vắc xin<br/>(Vaccine Name)</th>
                  <th style={{ ...styles.thCenter, width: '110px' }}>Ngày giờ tiêm<br/>(Date & Time)</th>
                  <th style={{ ...styles.th, width: '22%' }}>Nhà sản xuất<br/>(Manufacturer)</th>
                  <th style={{ ...styles.thCenter, width: '90px' }}>Giá<br/>(Price)</th>
                  <th style={{ ...styles.th, width: '18%' }}>Người tiêm<br/>(Administered)</th>
                </tr>
              </thead>
              <tbody>
                {appointment && appointment.vaccines && appointment.vaccines.length > 0 ? (
                  appointment.vaccines.map((vaccine, index) => (
                    <tr key={index}>
                      <td style={{ ...styles.tdCenter, fontWeight: 'bold', fontSize: '14px', backgroundColor: '#f9fafb' }}>{index + 1}</td>
                      <td style={{ ...styles.td, fontWeight: '600' }}>{vaccine.name}</td>
                      <td style={styles.tdCenter}>
                        {formatDate(appointment.scheduled_at)}
                        <br/>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>{formatTime(appointment.scheduled_at)}</span>
                      </td>
                      <td style={styles.td}>{vaccine.manufacturer}</td>
                      <td style={{ ...styles.tdCenter, fontWeight: '600', color: '#059669' }}>{Number(vaccine.price || 0).toLocaleString('vi-VN')} VNĐ</td>
                      <td style={styles.td}>{appointment.administered_by || 'Nhân viên y tế'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ ...styles.td, textAlign: 'center', fontStyle: 'italic', padding: '16px', color: '#6b7280' }}>
                      Không có dữ liệu tiêm chủng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {appointment && (
              <div style={styles.notes}>
                <p style={{ fontWeight: '600', marginBottom: '8px', margin: 0 }}>GHI CHÚ (Notes):</p>
                <p style={{ marginBottom: '4px', margin: 0 }}>• Tình trạng sức khỏe: Bình thường</p>
                <p style={{ marginBottom: '4px', margin: 0 }}>• Số lượng vắc xin: {appointment.vaccines?.length || 0} loại</p>
                <p style={{margin: 0}}>• Địa điểm tiêm: Trung tâm Tiêm chủng Vaxis</p>
                {appointment.notes && (
                  <p style={{margin: 0, marginTop: '4px'}}>• Ghi chú: {appointment.notes}</p>
                )}
              </div>
            )}
          </div>

          {/* Footer / Signature */}
          <div style={styles.footer}>
            <div></div>
            <div style={styles.signatureSection}>
              <p style={{ fontStyle: 'italic', fontSize: '14px', marginBottom: '4px', margin: 0 }}>
                Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </p>
              <p style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px', margin: '8px 0' }}>
                XÁC NHẬN CỦA ĐƠN VỊ TIÊM CHỦNG
              </p>
              <p style={{ fontStyle: 'italic', fontSize: '12px', marginBottom: '48px', margin: 0 }}>(Ký, đóng dấu)</p>
              
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
            * Chứng nhận này có giá trị chứng minh lịch sử tiêm chủng của người dân trên hệ thống VAXIS.
          </div>
        </div>
      </div>
    </div>
  )
})

export default VaccinationCertificateTemplate