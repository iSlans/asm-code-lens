MOV
MOV src, dst 
 dst = src

 do not [MOV $myvar, dst], as [LEA myvar, dst]
 no Flag modified

@@@
LEA
LEA src, dst 
copy the address 
no Flag modified

@@@
XCHG
XCHG src, dst 
 switch contents 
 no Flag modified

@@@
IN
IN {src / (%DX)}, {%AL / %AX} 
 system privilege
 src < 256 
 copy in input 
 no Flag modified

@@@
OUT
OUT {%AL / %AX}, {dst / (%DX)} 
 system privilege
 dst < 256 
 copy in output 
 no Flag modified

@@@
PUSH
PUSH src 
src 16/32 bit 
decrement ESP, copy src in (%ESP) 
no Flag modified

@@@
POP
POP dst   
dst 16/32bit  
copy (%ESP) in dst, increment ESP; 
no Flag modified

@@@
PUSHAD
PUSHAD 
save on stack EAX, ECX, EDX, EBX, ESP, EBP, ESI, EDI 
no Flag modified

@@@
POPAD
POPAD   
retrieve from stack EDI, ESI, EBP, ESP, EBX, EDX, ECX, EAX 
ESP is not overwrited 
no Flag modified

@@@
ADD
ADD src, dst 
dst += src 
CF = 1 if got carry as naturals 
OF = 1 if got overflow as integers (concordant operands or result discordant with operands) 
ZF = 1 if result all bits are zeros 
SF = MSB(result) 
all Flags modified

@@@
SUB
SUB src, dst 
dst -= src 
CF = 1 if got borrow as naturals 
OF = 1 if got overflow as integers
all Flags modified

@@@
INC
INC dst 
as ADD $1, dst, but CF is not modified 
Flags OF, SF, ZF modified

@@@
DEC
DEC dst 
as SUB $1, dst, but CF is not modified 
Flags OF, SF, ZF modified

@@@
ADC
ADC src, dst
dst += src + CF
all Flags modified

@@@
SBB
SBB src, dst
dst -= (src + CF)
all Flags modified

@@@
NEG
NEG dst
dst = -dst as integer
OF = 1 if not possible
CF = 1 always if not 0
CF = 0 if dst is 0
all Flags modified

@@@
CMP
CMP src, dst
dst >, ==, < src (naturals or integers)
all Flags modified

@@@
MUL
MUL src
 naturals multiply

 > src  8 bit: src * AL  →  AX 
 > src 16 bit: src * AX  →  DX_AX
 > src 32 bit: src * EAX →  EDX_EAX
 
 CF = OF = 1 if result bits > src bits
 CF = OF = 0 otherwise
 SF undefined 
 ZF undefined 

@@@
IMUL
IMUL src
integers multiply
src 8bit:  src*AL  --> AX
src 16bit: src*AX  --> DX_AX
src 32bit: src*EAX --> EDX_EAX
Flags CF, OF, SF, ZF modified

@@@
DIV
DIV src
src 8bit:   AX / src      : Q --> AL    R--> AH 
src 16bit:  DX_AX / src   : Q --> AX    R--> DX 
src 32bit:  EDX_EAX / src : Q --> EAX   R--> EDX 
Remind to unset DX | EDX if needed
all Flags modified

@@@
IDIV
IDIV src
src  8 bit:  AX / src      : Q --> AL   R--> AH 
src 16 bit:  DX_AX / src   : Q --> AX   R--> DX 
src 32 bit:  EDX_EAX / src : Q --> EAX  R--> EDX 
 
 Remainder sign is always equal to dividend sign
 Remind to unset DX | EDX if needed
 all Flags modified

@@@
CWDE
CWDE
 extend AX as integer to EAX
 no Flag modified

@@@
SHL
SHL src, dst [, SHL dst ]
 src as natural
 src default 1, src <= 31
 src immediate or CL

 CF ← □□□□□□□□□□□□□□□□ ← 0

 all Flags modified

@@@
SAL
SAL src, dst [, SAL dst ]
 src as integer ?
 src default 1, src <= 31
 src immediate or CL

 CF ← □□□□□□□□□□□□□□□□ ← 0

 all Flags modified

@@@
SHR
SHR src, dst [, SHR dst ]
 src as natural
 src default 1, src <= 31
 src immediate or CL
 
 0 → □□□□□□□□□□□□□□□□ → CF

 OF = 0
 all Flags modified

@@@
SAR
SAR src, dst [, SAR dst ]
 dst as integer
 src default 1, src <= 31
 src immediate or CL
 
 MSB → □□□□□□□□□□□□□□□□ → CF

 all Flags modified

@@@
ROL
ROL src, dst [, ROL dst ]
 src as natural
 src default 1, src <= 31

 CF ← □□□□□□□□□□□□□□□□ ← MSB
 
 Flags CF, OF modified

@@@
RCL
RCL src, dst [, RCL dst ]
 src as natural
 src default 1, src <= 31

 CF ← □□□□□□□□□□□□□□□□ ← CF
 
 Flags CF, OF modified

@@@
ROR
ROR src, dst [, ROR dst ]
 src as natural
 src default 1, src <= 31

 LSB → □□□□□□□□□□□□□□□□ → CF
 
 Flags CF, OF modified

@@@
RCR
RCR src, dst [, RCR dst ]
 src as natural
 src default 1, src <= 31

 CF → □□□□□□□□□□□□□□□□ → CF
 Flags CF, OF modified

@@@
NOT
NOT dest
 bitwise not
 
 no Flag modified

@@@
AND
AND src, dst
 bitwise and

 CF = OF = 0
 all Flags modified

@@@
OR
OR src, dst
 bitwise or

 CF = OF = 0
 all Flags modified

@@@
XOR
XOR src, dst
 bitwise xor

 $0x20, dst to invert bit n.5 of dst

 CF = OF = 0
 all Flags modified

@@@
JMP
JMP address
 EIP = address
 no Flag modified

@@@
JZ
JZ address
 jump if ZF = 1

@@@
JNZ
JNZ address
 jump if ZF = 0

@@@
JC
JC address
 jump if CF = 1

@@@
JNC
JNC address
 jump if CF = 0

@@@
JO
JO address
 jump if OF = 1

@@@
JNO
JNO address
 jump if OF = 0

@@@
JS
JS address
 jump if SF = 1

@@@
JNS
JNS address
 jump if SF = 0

@@@
JE
JE address
 jump if equal after CMP

@@@
JNE
JNE address
 jump if not equal after CMP

@@@
JA
JA address
 jump if above as naturals

@@@
JAE
JAE address
 jump if above or equal as naturals

@@@
JB
JB address
 jump if below as naturals

@@@
JBE
JBE address
 jump if below or equal as naturals

@@@
JG
JG address
 jump if greater as integers

@@@
JGE
JGE address
 jump if greater or equal as integers

@@@
JL
JL address
 jump if less as integers

@@@
JLE
JLE address
 jump if less or equal as integers

@@@
CALL
CALL subprogram
 no Flag modified

@@@
RET
RET
 return from subprogram
 no Flag modified

@@@
NOP
NOP
 does nothing
 no Flag modified

@@@
HLT
HLT
 system privilege
 stop execution

@@@
LOOP
LOOP address
 decrement ECX
 if ECX != 0, jmp to address

@@@
LOOPE
LOOPE address
 decrement ECX
 if ECX != 0 && "equal" after CMP, jmp to address

@@@
LOOPNE
LOOPNE address
 decrement ECX
 if ECX != 0 && "not equal" after CMP, jmp to address

@@@
INCHAR
CALL inchar
 get input ASCII in AL
 does not eco 

@@@
OUTCHAR
CALL outchar
 eco the ASCII of AL

@@@
NEWLINE
CALL newline
 print CarriageReturn and LineFeed

@@@
PAUSE
CALL pauseN
 pause the program and
 print "Checkpoint number N. Press any key to continue"

@@@
INLINE
CALL inline
 @param EBX: address of buffer
 @param CX: number of char to read (max 80)

@@@
OUTLINE
CALL outline
 @param EBX: address of buffer to print

 print max 80 char, or until CarriageReturn

@@@
OUTMESS
CALL outmess
 @param EBX: address of buffer
 @param CX: number of char to print

@@@
INBYTE
CALL inbyte
 get 2 hex char (with eco) (ignore other chars)
 save in AL

@@@
INWORD
CALL inword
 get 4 hex char (with eco) (ignore other chars)
 save in AX

@@@
INLONG
CALL inlong
 get 8 hex char (with eco) (ignore other chars)
 save in EAX

@@@
OUTBYTE
CALL outbyte
 print 2 hex char from AL as natural

@@@
OUTWORD
CALL outword
 print 4 hex char from AX as natural

@@@
OUTLONG
CALL outlong
 print 8 hex char from EAX as natural

@@@
INDECIMAL_BYTE
CALL indecimal_byte
 get 3 or less decimal char (with eco) (ignore other chars)
 and save in AL

@@@
INDECIMAL_WORD
CALL indecimal_word
 get 5 or less decimal char (with eco) (ignore other chars)
 and save in AX

@@@
INDECIMAL_LONG
CALL indecimal_long
 get 10 or less decimal char (with eco) (ignore other chars)
 and save in EAX

@@@
OUTDECIMAL_BYTE
CALL outdecimal_byte
 print AL as decimal natural

@@@
OUTDECIMAL_WORD
CALL outdecimal_word
 print AX as decimal natural

@@@
OUTDECIMAL_LONG
CALL outdecimal_long
 print EAX as decimal natural

@@@
MOVS
MOVSsuffix [, REP MOVSsuffix]
 copy from ESI to EDI [suffix]bytes
 and add/sub from ESI and EDI [suffix]bytes { DF=0 / DF=1 }

 REP: repeat ECX times (decremented until 0)

 no Flag modified

@@@
STD
STD
 set DF = 1

@@@
CLD
CLD
 set DF = 0

@@@
LODS
LODSsuffix
 copy in AL/AX/EAX from ESI [suffix]bytes
 and add/sub ESI [suffix]bytes { DF=0 / DF=1 }

@@@
STOS
STOSsuffix [, REP STOSsuffix]
 copy from AL/AX/EAX to EDI [suffix]bytes
 and add/sub EDI [suffix]bytes { DF=0 / DF=1 }

 REP: repeat ECX times (decremented until 0)

@@@
CMPS
CMPSsuffix [, REPE CMPSsuffix, REPNE CMPSsuffix]
 compare memory pointed by ESI and EDI
 and add/sub EDI [suffix]bytes { DF=0 / DF=1 }

 REP: repeat max ECX times, until condition (equal / not equal)

@@@
SCAS
SCASsuffix [, REPE SCASsuffix, REPNE SCASsuffix]
 compare AL/AX/EAX with memory pointed by EDI
 and add/sub EDI [suffix]bytes { DF=0 / DF=1 }

 REP: repeat max ECX times, until condition (equal / not equal)
